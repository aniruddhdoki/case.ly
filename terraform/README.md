# Terraform: casey AWS Resources

Provisions IAM policy and CloudWatch log group, and attaches the policy to a configurable service account for backend development.

## Admin vs Service Account

Terraform uses two distinct AWS principals:

| Account | Purpose | When used |
|---------|---------|-----------|
| **Admin account** | Runs `terraform plan` and `terraform apply`; creates IAM policies, attaches to users, creates CloudWatch resources | Only when applying Terraform |
| **Service account** | Runs the casey backend at runtime; calls Transcribe, Bedrock, Polly, CloudWatch Logs | Only when the backend is running |

**Important:** The service account must never be used to run Terraform. The admin account must never be used by the backend. Keep these credentials separate.

## Prerequisites

- Terraform installed
- AWS CLI configured with credentials for a principal that can create IAM policies, attach them to users, and create CloudWatch log groups (your admin IAM user)

## Configure AWS credentials for Terraform

Use your **admin** IAM user credentials when running Terraform. Choose one:

### Option A: .env file (recommended for local development)

1. Copy `.env.example` to `.env` (if it exists) or create `.env` in the `terraform/` directory
2. Edit `.env` and add your admin AWS credentials:
   ```bash
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_admin_access_key_id
   AWS_SECRET_ACCESS_KEY=your_admin_secret_access_key
   ```
3. Source the file before running Terraform:
   ```bash
   source .env
   terraform plan
   terraform apply
   ```

**Note:** The `.env` file is gitignored and will not be committed to the repository.

### Option B: AWS CLI default profile

```bash
aws configure
# Enter your admin IAM user's Access Key ID and Secret Access Key
# Default region: us-east-1
```

### Option C: Named profile

```bash
aws configure --profile casey-admin
# Enter your admin IAM user's Access Key ID and Secret Access Key
```

Then when running Terraform:

```bash
export AWS_PROFILE=casey-admin
```

### Option D: Environment variables

```bash
export AWS_ACCESS_KEY_ID=your_admin_access_key
export AWS_SECRET_ACCESS_KEY=your_admin_secret_key
export AWS_REGION=us-east-1
```

## Deploy

```bash
cd terraform
terraform init
terraform plan    # Review changes
terraform apply   # Type 'yes' to confirm
```

## What gets created

- **IAM policy** `casey-backend-ai` – Transcribe, Bedrock, Polly, CloudWatch Logs permissions (including `bedrock:GetInferenceProfile` for inference profiles)
- **Policy attachment** – Attached to the service account IAM user (default: `casey_localdev_service`)
- **CloudWatch log group** `casey-backend-aws-usage`

The service account IAM user must already exist. Terraform does not create it. Override the default with `-var="service_account_iam_user_name=your_service_user"` if needed.

## Local development (backend)

After `terraform apply`, run the backend with the **service account** credentials (not the admin credentials):

```bash
# In backend/.env or environment
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<service account access key>
AWS_SECRET_ACCESS_KEY=<service account secret key>
```

Or configure an AWS profile that uses the service account credentials and set `AWS_PROFILE` to that profile name.

**Credentials separation:** Do not use the same credentials for Terraform and for the backend. Terraform should use admin credentials; the backend should use the service account credentials.
