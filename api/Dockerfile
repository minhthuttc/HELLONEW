# Sử dụng NodeJS base image
FROM node:18

# Tạo thư mục làm việc
WORKDIR /usr/src/app

# Sao chép package.json trước để cài đặt phụ thuộc
COPY package*.json ./

# Cài đặt các phụ thuộc
RUN npm install

# Sao chép toàn bộ mã nguồn vào container
COPY . .

# Mở port (giả sử backend chạy cổng 3000)
EXPOSE 5000

# Lệnh chạy ứng dụng
CMD ["node", "server.js"]