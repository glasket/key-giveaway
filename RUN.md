# Local Environment Instructions

## Running the backend:

Inside the `backend` directory:

1. `docker-compose up` to start the local dynamodb instance
   - Optional: `docker-compose up -d` in order to detach from the container (it doesn't log anything useful)
   - First Run: `./build-table.sh <AWS_PROFILE>` is required in order to populate the container with the DB table
2. `./build-local.sh` to ensure the lambda's are configured for local execution
3. `aws sso login --profile <AWS_PROFILE>` in order to login
4. `./run-local.sh <AWS_PROFILE>`

### SELinux

If using SELinux, you can either use moby-engine and remove the --selinux-enabled flag, or you can use
`sudo setenforce permissive` while using AWS SAM.  
Hopefully this will be resolved eventually (see: aws/aws-sam-cli#2360)

## Running the frontend:

Inside the `frontend` directory:

1. Run the backend
2. `yarn run dev`
