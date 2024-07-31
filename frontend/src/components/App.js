import React, { useState, useEffect } from 'react';
import '../styles.css';
import * as XLSX from 'xlsx';

// 자리번호별 기본 데이터
let seatData = {};

// 로컬 저장소에서 사용자 데이터를 불러오기
function loadUserData() {
    const savedData = localStorage.getItem('userSeatData');
    return savedData ? JSON.parse(savedData) : {};
}

// 로컬 저장소에 사용자 데이터 저장하기
function saveUserData(userSeatData) {
    localStorage.setItem('userSeatData', JSON.stringify(userSeatData));
}

let userSeatData = loadUserData();

function App() {
    const [seatNumber, setSeatNumber] = useState('');
    const [name, setName] = useState('');
    const [currentStatus, setCurrentStatus] = useState('');
    const [times, setTimes] = useState({
        입실: '',
        외출: '',
        복귀: '',
        퇴실: ''
    });
    const [userTimes, setUserTimes] = useState({
        입실: '',
        외출: '',
        복귀: '',
        퇴실: ''
    });

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3000');

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.seatNumber === seatNumber) {
                setTimes(prevTimes => ({
                    ...prevTimes,
                    [data.status]: data.time
                }));   // 데이터 처리 로직 추가
            }
        };

        return () => {
            ws.close();
        };
    }, [seatNumber]);

    function loadInfo() {
        const data = seatData[seatNumber];
        const userData = userSeatData[seatNumber];

        if (data) {
            setName(data.name);
            setTimes(data.times);

            if (userData) {
                setUserTimes(userData);
            } else {
                setUserTimes({
                    입실: '',
                    외출: '',
                    복귀: '',
                    퇴실: ''
                });
            }
        } else {
            alert('해당 자리번호에 대한 정보가 없습니다.');
        }
    }

    function setStatus(status) {
        const data = seatData[seatNumber];

        if (!data) {
            alert('먼저 자리번호를 입력하고 불러오기를 클릭하세요.');
            return;
        }

        const confirmation = window.confirm(`정말로 ${status} 시간을 기록하시겠습니까?`);
        if (!confirmation) {
            return;
        }

        if (status === '복귀') {
            setCurrentStatus('입실');
        } else {
            setCurrentStatus(status);
        }

        showTime(status);

        // 서버로 데이터 전송
        fetch('http://localhost:3000/record', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                seatNumber: seatNumber,
                name: data.name,
                status: status,
                time: new Date().toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit'
                })
            })
        })
            .then(response => response.json())
            .then(data => console.log(data))
            .catch(error => console.error('Error:', error));
    }

    function showTime(action) {
        const now = new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
        setUserTimes(prevTimes => ({
            ...prevTimes,
            [action]: now
        }));

        if (!userSeatData[seatNumber]) {
            userSeatData[seatNumber] = {};
        }
        userSeatData[seatNumber][action] = now;
        saveUserData(userSeatData);
    }

    // 엑셀로 내보내기 기능
    function exportToExcel() {
        const wb = XLSX.utils.book_new();

        const ws_data = [
            ["자리번호", "이름", "입실", "외출", "복귀", "퇴실"]
        ];

        Object.keys(seatData).forEach(seatNumber => {
            const userData = userSeatData[seatNumber] || {};
            ws_data.push([
                seatNumber,
                seatData[seatNumber].name,
                userData.입실 || '',
                userData.외출 || '',
                userData.복귀 || '',
                userData.퇴실 || ''
            ]);
        });

        const ws = XLSX.utils.aoa_to_sheet(ws_data);
        XLSX.utils.book_append_sheet(wb, ws, "입출입 기록");

        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const filename = `${formattedDate}_입출입기록.xlsx`;

        XLSX.writeFile(wb, filename);
    }

    // 엑셀로 불러오기 기능
    function importFromExcel() {
        const input = document.getElementById('input-excel');
        if (!input.files.length) {
            alert('엑셀 파일을 선택해주세요.');
            return;
        }

        const file = input.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

                rows.slice(1).forEach(row => {
                    const seatNumber = row[0];
                    seatData[seatNumber] = {
                        name: row[1],
                        times: {
                            입실: row[2],
                            외출: row[3],
                            복귀: row[4],
                            퇴실: row[5]
                        }
                    };
                });
            });

            alert('엑셀 파일에서 데이터를 불러왔습니다.');
        };

        reader.readAsArrayBuffer(file);
    }

    return (
        <div className="table-container">
            <table>
                <tr>
                    <td colSpan="4" className="header-cell">
                        <input
                            type="number"
                            id="seat-number"
                            placeholder="자리번호 입력"
                            value={seatNumber}
                            onChange={(e) => setSeatNumber(e.target.value)}
                        />
                        <button onClick={loadInfo}>불러오기</button>
                        <button onClick={exportToExcel}>엑셀로 내보내기</button>
                        <button onClick={importFromExcel}>엑셀로 불러오기</button>
                        <input type="file" id="input-excel" accept=".xlsx, .xls" />
                    </td>
                </tr>
                <tr className="gray-background">
                    <td>이름</td>
                    <td id="name">{name}</td>
                    <td>현재상태</td>
                    <td id="current-status">{currentStatus}</td>
                </tr>
                <tr className="gray-background">
                    <td>입실</td>
                    <td>외출</td>
                    <td>복귀</td>
                    <td>퇴실</td>
                </tr>
                <tr>
                    <td id="입실-시간">{times.입실}</td>
                    <td id="외출-시간">{times.외출}</td>
                    <td id="복귀-시간">{times.복귀}</td>
                    <td id="퇴실-시간">{times.퇴실}</td>
                </tr>
                <tr>
                    <td>
                        <button onClick={() => setStatus('입실')}>입실 버튼</button>
                    </td>
                    <td>
                        <button onClick={() => setStatus('외출')}>외출 버튼</button>
                    </td>
                    <td>
                        <button onClick={() => setStatus('복귀')}>복귀 버튼</button>
                    </td>
                    <td>
                        <button onClick={() => setStatus('퇴실')}>퇴실 버튼</button>
                    </td>
                </tr>
                <tr>
                    <td id="입실-시간-값">{userTimes.입실}</td>
                    <td id="외출-시간-값">{userTimes.외출}</td>
                    <td id="복귀-시간-값">{userTimes.복귀}</td>
                    <td id="퇴실-시간-값">{userTimes.퇴실}</td>
                </tr>
            </table>
        </div>
    );
}

export default App;
