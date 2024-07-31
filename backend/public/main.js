document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#data-table tbody');

    function addRow(record) {
        const tr = document.createElement('tr');

        const today = new Date().toLocaleDateString('ko-KR'); // 오늘 날짜

        const dateTd = document.createElement('td');
        dateTd.textContent = today;
        tr.appendChild(dateTd);

        const seatNumberTd = document.createElement('td');
        seatNumberTd.textContent = record.seatNumber;
        tr.appendChild(seatNumberTd);

        const nameTd = document.createElement('td');
        nameTd.textContent = record.name;
        tr.appendChild(nameTd);

        const 입실Td = document.createElement('td');
        입실Td.textContent = record.status === '입실' ? record.time : '';
        tr.appendChild(입실Td);

        const 외출Td = document.createElement('td');
        외출Td.textContent = record.status === '외출' ? record.time : '';
        tr.appendChild(외출Td);

        const 복귀Td = document.createElement('td');
        복귀Td.textContent = record.status === '복귀' ? record.time : '';
        tr.appendChild(복귀Td);

        const 퇴실Td = document.createElement('td');
        퇴실Td.textContent = record.status === '퇴실' ? record.time : '';
        tr.appendChild(퇴실Td);

        tableBody.appendChild(tr);
    }

    // 기존 기록 가져오기
    fetch('/record')
        .then(response => response.json())
        .then(records => {
            records.forEach(record => addRow(record));
        })
        .catch(error => console.error('Error fetching records:', error));

    // WebSocket 연결
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
        const record = JSON.parse(event.data);
        addRow(record);
    };
});
