FROM node:18-alpine AS build
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Set build args
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_APP_TITLE
ARG REACT_APP_THEME_COLOR
ARG REACT_APP_DEFAULT_LANGUAGE
ARG REACT_APP_DEFAULT_THEME
ARG REACT_APP_REFRESH_INTERVAL

# Export environment variables
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_APP_TITLE=$REACT_APP_APP_TITLE
ENV REACT_APP_THEME_COLOR=$REACT_APP_THEME_COLOR
ENV REACT_APP_DEFAULT_LANGUAGE=$REACT_APP_DEFAULT_LANGUAGE
ENV REACT_APP_DEFAULT_THEME=$REACT_APP_DEFAULT_THEME
ENV REACT_APP_REFRESH_INTERVAL=$REACT_APP_REFRESH_INTERVAL

# Install dependencies
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

