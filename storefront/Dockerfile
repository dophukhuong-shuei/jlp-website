# Site tĩnh — build cần MEDUSA_BACKEND_URL/KEY trỏ tới backend ĐANG CHẠY và có dữ liệu.
# Đổi backend sau này (URL/sản phẩm mới) → phải build lại image, không chỉ restart container.
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG MEDUSA_BACKEND_URL
ARG MEDUSA_PUBLISHABLE_KEY
ENV MEDUSA_BACKEND_URL=${MEDUSA_BACKEND_URL}
ENV MEDUSA_PUBLISHABLE_KEY=${MEDUSA_PUBLISHABLE_KEY}
RUN npm run build

FROM nginx:alpine AS run
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
