# GitHub Actions OIDC role for CI, scoped to the SPA deploy (S3 sync +
# CloudFront invalidation) — replaces the long-lived AWS access keys in
# aws-s3-deploy.yml.
#
# The OIDC provider itself is created by uniflow-academic-service/terraform
# (only one "token.actions.githubusercontent.com" provider can exist per AWS
# account). Apply that stack before this one; here it's only referenced.

data "aws_caller_identity" "current" {}

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_ssm_parameter" "spa_bucket_name" {
  name = "/${var.project-tag}/spa_bucket_name"
}

data "aws_ssm_parameter" "cloudfront_distribution_id" {
  name = "/${var.project-tag}/cloudfront_distribution_id"
}

data "aws_iam_policy_document" "github_actions_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repo}:environment:${var.github_deploy_environment}"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "${var.project-tag}-frontend-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_actions_assume.json

  tags = {
    projects = var.project-tag
  }
}

data "aws_iam_policy_document" "github_actions_deploy" {
  statement {
    sid = "S3Sync"
    actions = [
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket",
    ]
    resources = [
      "arn:aws:s3:::${data.aws_ssm_parameter.spa_bucket_name.value}",
      "arn:aws:s3:::${data.aws_ssm_parameter.spa_bucket_name.value}/*",
    ]
  }

  statement {
    sid       = "CloudFrontInvalidate"
    actions   = ["cloudfront:CreateInvalidation"]
    resources = ["arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${data.aws_ssm_parameter.cloudfront_distribution_id.value}"]
  }
}

resource "aws_iam_role_policy" "github_actions_deploy" {
  name   = "spa-deploy"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions_deploy.json
}
