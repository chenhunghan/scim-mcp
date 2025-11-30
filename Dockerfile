# Use Node.js LTS as base image
FROM node:20-slim

# Set up a new user named "user" with user ID 1000
# Check if user already exists, if not create it
RUN id -u 1000 &>/dev/null || useradd -m -u 1000 user

# Switch to the "user" user
USER user

# Set home to the user's home directory
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

# Set the working directory to the user's home directory
WORKDIR $HOME/app

# Copy demo package files with correct ownership
COPY --chown=user demo/package*.json ./

# Install dependencies
RUN npm ci

# Copy the demo application with correct ownership
COPY --chown=user demo/ .

# Build the application
RUN npm run build

# Expose port 7860 (Hugging Face Spaces default)
EXPOSE 7860

# Run the preview server on port 7860
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "7860"]
