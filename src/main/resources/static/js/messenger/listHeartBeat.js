/**
 * list.jsp - HeartBeat
 */
let stompClient = null;
function connectWebSocketChatList(rooms) {
	const socket = new SockJS('http://52.78.103.13/ws-stomp');
	stompClient = Stomp.over(socket);
	stompClient.connect({}, function(frame) {
		console.log("Connected: " + frame);
		rooms.forEach(room => {
			stompClient.subscribe("/sub/chat/" + room, (msg) => {
				renderHtmlChatList(room);
			})
		});
	}, (err) => {
		console.error("Disconnected. Reconnecting in 5s...");
		setTimeout(() => connectWebSocket(staffCode), 5000);
	});	
}

function renderHtmlChatList(room) {
	fetch('/msg/new', {
		method: 'post',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ chatRoomNum: room })
	})
	.then(response => response.json())
	.then(response => {
		let badge = document.querySelector('#unread-count-' + room);
		if (badge.innerText == "") {
			badge.innerText = 1;
		} else {
			let newCount = parseInt(badge.innerText) + 1;
			badge.innerText = newCount;
		}
		let latestMessage = document.querySelector('#chat-room-last-' + room);
		if (response.chatBodyContent.trim().substr(0, 17).includes('\n')) {
			latestMessage.innerText = response.chatBodyContent.trim().split('\n')[0] + '...';
		} else if (response.chatBodyContent.length >= 17) {
			latestMessage.innerText = response.chatBodyContent.trim().substr(0, 17) + '...';				
		} else {
			latestMessage.innerText = response.chatBodyContent.trim();		
		}
		let time = document.querySelector('#time-' + room);
        let timeFromJava = response.chatBodyDtm;
		let today = new Date();
		const timeToJs = new Date(timeFromJava);
		if (response.chatBodyContent == '메시지 없음') {
		    time.innerText = '';
		} else {
		    if (timeToJs.getDate() == today.getDate()) {
		        time.innerText = timeToJs.getHours() + '시 ' + timeToJs.getMinutes() + '분';
		    } else if (timeToJs.getDate() == today.getDate() - 1) {
		        time.innerText = '어제';
		    } else {
		        time.innerText = timeToJs.getMonth() + 1 + '월 ' + timeToJs.getDate() + '일';
		    }
		}
	})
}