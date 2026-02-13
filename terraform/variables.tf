variable "aws_region" {
  description = "AWS region for Transcribe, Bedrock, Polly"
  type        = string
  default     = "us-east-1"
}

variable "service_account_iam_user_name" {
  description = "IAM user name for the service account that runs the backend (e.g. casey_localdev_service, casey_prod_service)"
  type        = string
  default     = "casey_localdev_service"
}
