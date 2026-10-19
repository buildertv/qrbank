# Sử dụng Node.js bản nhẹ (Alpine)
FROM node:20-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy package.json và cài đặt thư viện
COPY package*.json ./
RUN npm install --production

# Copy toàn bộ mã nguồn còn lại vào container
COPY . .

# Mở cổng 3000
EXPOSE 3000

# Lệnh chạy ứng dụng
CMD ["node", "server.js"]
