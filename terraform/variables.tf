variable "project-tag" {
  type        = string
  description = "The tag to use for the project"
  default     = "uniflow"
}

variable "aws_region" {
  type        = string
  description = "AWS region for the frontend stack"
  default     = "us-east-1"
}

variable "github_repo" {
  type        = string
  description = "GitHub repo allowed to assume the CI role via OIDC, as org/repo"
  default     = "UniFlowProject/UniFlow-Frontend"

  validation {
    condition     = !can(regex("[*?]", var.github_repo))
    error_message = "github_repo must not contain wildcards (* or ?) — the OIDC trust condition uses StringEquals and expects an exact org/repo."
  }
}

variable "github_deploy_branch" {
  type        = string
  description = "Branch allowed to assume the CI role via OIDC (matches the aws-s3-deploy.yml trigger)"
  default     = "main"
}
