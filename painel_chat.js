// ══════════════════════════════════════════════════════════════
// CHAT DE CHAMADOS — Adicionar ao index.html do painel
// ══════════════════════════════════════════════════════════════
//
// 1. Adicionar script do socket.io antes do </body>:
//    <script src="https://cdn.socket.io/4.7.5/socket.io.min.js"></script>
//
// 2. Adicionar CSS (dentro do <style>):

/*
#chat-modal { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9999; align-items:center; justify-content:center; }
#chat-modal.open { display:flex; }
.chat-box { background:#fff; border-radius:16px; width:420px; max-width:95vw; height:580px; display:flex; flex-direction:column; overflow:hidden; }
.chat-header { padding:16px 20px; border-bottom:1px solid #E3E8EE; display:flex; align-items:center; gap:12px; }
.chat-header h3 { flex:1; margin:0; font-size:15px; color:#1E2D3D; }
.chat-header button { background:none; border:none; cursor:pointer; font-size:20px; color:#9AAABB; }
.chat-msgs { flex:1; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; }
.chat-msg { max-width:75%; }
.chat-msg.mine { align-self:flex-end; }
.chat-msg.other { align-self:flex-start; }
.chat-bubble { padding:10px 14px; border-radius:16px; font-size:13px; line-height:1.5; }
.chat-msg.mine .chat-bubble { background:#3ECFBF; color:#fff; border-bottom-right-radius:4px; }
.chat-msg.other .chat-bubble { background:#F5F7F9; color:#1A2532; border:1px solid #E3E8EE; border-bottom-left-radius:4px; }
.chat-autor { font-size:11px; color:#9AAABB; margin-bottom:3px; }
.chat-hora { font-size:10px; color:#9AAABB; margin-top:3px; }
.chat-msg.mine .chat-hora { text-align:right; }
.chat-input-wrap { padding:12px; border-top:1px solid #E3E8EE; display:flex; gap:8px; }
.chat-input-wrap textarea { flex:1; border:1px solid #E3E8EE; border-radius:12px; padding:10px 14px; font-size:13px; resize:none; height:42px; outline:none; }
.chat-input-wrap button { background:#3ECFBF; border:none; border-radius:12px; padding:0 16px; color:#1E2D3D; font-weight:700; cursor:pointer; }
*/

// 3. Adicionar HTML (antes do </body>):
/*
<div id="chat-modal">
  <div class="chat-box">
    <div class="chat-header">
      <div>
        <h3 id="chat-titulo">Chat do chamado</h3>
        <div id="chat-subtitulo" style="font-size:12px;color:#9AAABB;"></div>
      </div>
      <button onclick="fecharChat()">✕</button>
    </div>
    <div class="chat-msgs" id="chat-msgs"></div>
    <div class="chat-input-wrap">
      <textarea id="chat-input" placeholder="Digite sua resposta..." rows="1"
        onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();enviarMsgChat();}"></textarea>
      <button onclick="enviarMsgChat()">Enviar</button>
    </div>
  </div>
</div>
*/

// 4. Adicionar JavaScript:

var _chatChamadoId = null;
var _chatSocket    = null;
var _chatUserId    = null;

function abrirChat(chamadoId, pedidoNum, farmNome, motivo) {
  _chatChamadoId = chamadoId;
  document.getElementById('chat-titulo').textContent = 'Chat · Pedido #' + pedidoNum;
  document.getElementById('chat-subtitulo').textContent = farmNome + ' · ' + motivo;
  document.getElementById('chat-msgs').innerHTML = '<div style="text-align:center;color:#9AAABB;padding:20px">Carregando...</div>';
  document.getElementById('chat-modal').classList.add('open');

  // Carregar mensagens
  apiFetch('/chamados/' + chamadoId + '/mensagens').then(function(res) {
    renderMsgs(res.data || []);
  });

  // Conectar socket
  if (_chatSocket) { _chatSocket.disconnect(); }
  _chatSocket = io(window.API_BASE.replace('/api',''), { transports: ['websocket','polling'] });
  _chatSocket.emit('join_chamado', chamadoId);
  _chatSocket.on('nova_mensagem', function(msg) {
    appendMsg(msg);
  });
}

function fecharChat() {
  document.getElementById('chat-modal').classList.remove('open');
  if (_chatSocket) { _chatSocket.emit('leave_chamado', _chatChamadoId); _chatSocket.disconnect(); _chatSocket = null; }
  _chatChamadoId = null;
}

function renderMsgs(msgs) {
  var el = document.getElementById('chat-msgs');
  if (!msgs.length) {
    el.innerHTML = '<div style="text-align:center;color:#9AAABB;padding:40px">Nenhuma mensagem ainda.</div>';
    return;
  }
  el.innerHTML = '';
  msgs.forEach(function(m) { appendMsg(m, false); });
  el.scrollTop = el.scrollHeight;
}

function appendMsg(msg, scroll) {
  var me = (window._painelUser && window._painelUser.id === msg.autor_id);
  var hora = new Date(msg.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'});
  var div = document.createElement('div');
  div.className = 'chat-msg ' + (me ? 'mine' : 'other');
  div.innerHTML =
    (!me ? '<div class="chat-autor">' + msg.autor_nome + '</div>' : '') +
    '<div class="chat-bubble">' + escHtml(msg.texto) + '</div>' +
    '<div class="chat-hora">' + hora + '</div>';
  document.getElementById('chat-msgs').appendChild(div);
  if (scroll !== false) { document.getElementById('chat-msgs').scrollTop = 99999; }
}

function enviarMsgChat() {
  var input = document.getElementById('chat-input');
  var txt = input.value.trim();
  if (!txt || !_chatChamadoId) return;
  input.value = '';
  apiFetch('/chamados/' + _chatChamadoId + '/mensagens', {
    method: 'POST',
    body: JSON.stringify({ texto: txt })
  }).then(function(res) {
    if (!res.ok) { showToast('e', 'Erro', res.data.error || 'Não enviado.'); }
  });
}

function escHtml(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// 5. Na função renderChamados, adicionar botão "Chat" em cada linha:
// Dentro do loop de chamados, substituir o botão de responder por:
/*
  '<button onclick="abrirChat(\'' + c.id + '\',\'' + (c.pedido_numero||'—') + '\',\'' + (c.farmacia_nome||'') + '\',\'' + (c.motivo||'') + '\')" style="background:#3ECFBF;color:#1E2D3D;border:none;border-radius:8px;padding:6px 14px;cursor:pointer;font-weight:700;font-size:12px">💬 Chat</button>'
*/
