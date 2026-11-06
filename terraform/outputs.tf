output "github_actions_role_arn" {
  description = "Set this as the AWS_ROLE_ARN repo/environment variable in GitHub Actions"
  value       = aws_iam_role.github_actions.arn
}
