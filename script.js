// 자리번호별 데이터
const seatData = {
    1: {
        name: '홍길동',
        times: {
            입실: '09:00',
            외출: '점심 시간, 12:00',
            복귀: '14:00',
            퇴실: '18:00'
        }
    },
    // 다른 자리번호에 대한 데이터 추가 가능
    // 예: 2: { ... }
};

function loadInfo() {
    const seatNumber = document.getElementById('seat-number').value;
    const data = seatData[seatNumber];

    if (data) {
        // 이름 정보를 설정
        document.getElementById('name').innerText = data.name;

        // 버튼 위의 칸에 시간 정보 설정
        document.getElementById('입실-시간').innerText = data.times.입실;
        document.getElementById('외출-시간').innerText = data.times.외출;
        document.getElementById('복귀-시간').innerText = data.times.복귀;
        document.getElementById('퇴실-시간').innerText = data.times.퇴실;

        // 시간 값 초기화
        document.getElementById('입실-시간-값').innerText = '';
        document.getElementById('외출-시간-값').innerText = '';
        document.getElementById('복귀-시간-값').innerText = '';
        document.getElementById('퇴실-시간-값').innerText = '';
    } else {
        alert('해당 자리번호에 대한 정보가 없습니다.');
    }
}

function setStatus(status) {
    // 복귀 버튼을 눌렀을 때 현재상태 옆 칸에 '입실' 표시
    if (status === '복귀') {
        document.getElementById('current-status').innerText = '입실';
    } else {
        document.getElementById('current-status').innerText = status;
    }
    showTime(status);
}

function showTime(action) {
    const now = new Date().toLocaleTimeString();
    document.getElementById(`${action}-시간-값`).innerText = now;
}
