const express = require('express');
const router = express.Router();
const Record = require('../models/record'); // 모델 파일 임포트
const broadcast = require('../broadcast'); // broadcast 모듈 임포트

// 기록 저장 엔드포인트
router.post('/', async (req, res) => {
  const { seatNumber, name, status, time } = req.body;

  console.log('Received data:', { seatNumber, name, status, time }); // 요청 데이터 로그

  const newRecord = new Record({ seatNumber, name, status, time });
  
  try {
    const record = await newRecord.save();
    console.log('Saved record:', record); // 저장된 데이터 로그
    broadcast.broadcast(record); // WebSocket을 통해 브로드캐스트
    res.status(200).send(record);
  } catch (err) {
    console.error('Error saving record:', err); // 오류 로그
    res.status(500).send(err);
  }
});

// 기록 조회 엔드포인트
router.get('/:seatNumber', async (req, res) => {
  try {
    const records = await Record.find({ seatNumber: req.params.seatNumber });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
