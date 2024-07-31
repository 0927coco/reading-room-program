const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const broadcast = require('./broadcast'); // broadcast 모듈 임포트

const recordRoutes = require('./routes/record'); // 라우트 파일 임포트

const app = express();
const port = 3000;

// MongoDB 연결 설정
mongoose.connect('mongodb://localhost:27017/attendance', {});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// 미들웨어 설정
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공 설정

// 라우트 설정
app.use('/record', recordRoutes);

// 기본 라우트 설정 (index.html 제공)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// HTTP 서버 시작
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  broadcast.initialize(server); // WebSocket 서버 초기화
});

module.exports = app;
