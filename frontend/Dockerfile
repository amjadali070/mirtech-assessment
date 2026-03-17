FROM node:20-alpine

WORKDIR /app

# We rely on volume mounts for local development. 
# Installing dependencies on runtime ensures they are up to date 
# for the container filesystem (which isolates from the host node_modules mismatch).
CMD ["sh", "-c", "npm install && npm run dev"]
