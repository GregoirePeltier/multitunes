#!/bin/bash

# Check if env file path is provided
if [ $# -eq 0 ]; then
    echo "Error: Please provide the path to your .env file"
    echo "Usage: $0 /path/to/.env"
    exit 1
fi

ENV_FILE="$1"

# Check if provided env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Env file not found at: $ENV_FILE"
    exit 1
fi

# Load JWT_SECRET from provided env file
export $(grep JWT_SECRET "$ENV_FILE" | xargs)

# Verify JWT_SECRET was loaded
if [ -z "$JWT_SECRET" ]; then
    echo "Error: JWT_SECRET not found in $ENV_FILE!"
    exit 1
fi

# Create temporary directory for our files
mkdir -p ./jwt-temp
cd ./jwt-temp

# Create the JavaScript file
cat > generateToken.js << 'EOL'
const jwt = require('jsonwebtoken');
const fs = require('fs');

const secret = process.env.JWT_SECRET;
if (!secret) {
    console.error('JWT_SECRET environment variable is required');
    process.exit(1);
}

function generateToken() {
  try {
    const token = jwt.sign(
      {
        role: 'api-client',
        permissions: ['read', 'write']
      },
      secret,
      { 
        expiresIn: '7d',
        algorithm: 'HS256'
      }
    );
    
    // Write token to mounted volume
    fs.writeFileSync('/app/output/token.txt', token);
    console.log('Token generated successfully!');
    console.log('Token:', token);
  } catch (error) {
    console.error('Error generating token:', error);
    process.exit(1);
  }
}

generateToken();
EOL

# Create package.json
cat > package.json << 'EOL'
{
  "name": "jwt-generator",
  "version": "1.0.0",
  "dependencies": {
    "jsonwebtoken": "^9.0.2"
  }
}
EOL

# Create Dockerfile
cat > Dockerfile << 'EOL'
FROM node:20-slim

WORKDIR /app
COPY package.json .
COPY generateToken.js .

RUN npm install

CMD ["node", "generateToken.js"]
EOL

# Create output directory
mkdir -p output

# Build and run the Docker container
docker build -t jwt-generator .
docker run --rm \
  -e JWT_SECRET="$JWT_SECRET" \
  -v "$(pwd)/output:/app/output" \
  jwt-generator

# Move the token file to parent directory
mv output/token.txt ../jwt_token.txt

# Cleanup
cd ..
rm -rf ./jwt-temp

echo "JWT token has been generated and saved to jwt_token.txt"