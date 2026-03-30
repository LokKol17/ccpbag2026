/**
 * script.js - CC 2026/1
 * Lógica de renderização dinâmica para o Hub da Turma
 */

let allLinks = []; // Store links globally for filtering
let academicData = []; // Store academic data for materials modal
let avisosData = []; // Store avisos for detail modal

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupModal();
    setupClock();
    setupSearch();
});

async function fetchData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Erro ao carregar dados');
        const data = await response.json();
        
        allLinks = data.links_uteis; // Store for search
        academicData = data.academico; // Store for modal
        avisosData = data.avisos; // Store for modal
        
        renderAvisos(data.avisos);
        renderComunidade(data.comunidade);
        renderAcademico(data.academico);
        renderAgenda(data.agenda);
        renderHorario(data.horario);
        renderLinks(allLinks);
        renderContribuintes(data.contribuintes);
        
        setupAccordions();
    } catch (error) {
        console.error('Erro:', error);
    }
}

function setupClock() {
    const clockElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    function updateTime() {
        const now = new Date();
        
        // Atualiza a Hora
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        if (clockElement) clockElement.textContent = timeStr;
        
        // Atualiza a Data
        const options = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateStr = now.toLocaleDateString('pt-BR', options);
        // Capitaliza a primeira letra do dia da semana
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        if (dateElement) dateElement.textContent = dateStr;
    }
    updateTime();
    setInterval(updateTime, 60000);
}

function setupSearch() {
    const searchInput = document.getElementById('link-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = allLinks.map(cat => ({
                ...cat,
                links: cat.links.filter(l => 
                    l.nome.toLowerCase().includes(term) || 
                    l.desc.toLowerCase().includes(term)
                )
            })).filter(cat => cat.links.length > 0);
            
            renderLinks(filtered);
        });
    }
}

function renderAvisos(avisos) {
    const container = document.getElementById('avisos-container');
    if (!avisos || avisos.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum aviso no momento.</p>';
        return;
    }

    // Ordenar por ID decrescente (mais novos primeiro)
    const avisosOrdenados = [...avisos].sort((a, b) => b.id - a.id);

    container.innerHTML = avisosOrdenados.map(aviso => {
        const hasMore = aviso.descricao_longa && aviso.descricao_longa.trim() !== "";
        return `
            <div class="card glass">
                <span class="badge">${aviso.categoria}</span>
                <h3>${aviso.titulo}</h3>
                <p>${aviso.conteudo}</p>
                <div class="meta" style="margin-top: auto; flex-direction: column; align-items: flex-start; gap: 12px;">
                    <span><i class="ph ph-calendar"></i> ${formatDate(aviso.data)}</span>
                    ${hasMore ? `<button class="btn btn-primary" style="width: 100%; justify-content: center; font-size: 0.85rem;" onclick="openAvisoModal(${aviso.id})"><i class="ph ph-plus-circle"></i> Saiba mais</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function openAvisoModal(avisoId) {
    const modal = document.getElementById('aviso-modal');
    const title = document.getElementById('aviso-modal-title');
    const meta = document.getElementById('aviso-modal-meta');
    const content = document.getElementById('aviso-modal-content');
    
    const aviso = avisosData.find(a => a.id === avisoId);
    if (!aviso) return;

    title.textContent = aviso.titulo;
    meta.innerHTML = `<span><i class="ph ph-calendar"></i> ${formatDate(aviso.data)}</span> • <span class="badge">${aviso.categoria}</span>`;
    content.textContent = aviso.descricao_longa;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeAvisoModal() {
    const modal = document.getElementById('aviso-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function renderComunidade(canais) {
    const container = document.getElementById('comunidade-container');
    container.innerHTML = canais.map(canal => {
        const platform = canal.plataforma.toLowerCase();
        const isWhatsApp = platform === 'whatsapp';
        const isGoogle = platform === 'google agenda';
        const isMinecraft = platform === 'minecraft';
        
        let actionAttr = '';
        let href = canal.link || '#';
        let btnText = 'Entrar Agora';
        let btnIcon = 'ph-arrow-square-out';

        if (isWhatsApp) {
            actionAttr = `onclick="openWhatsAppModal(event, ${JSON.stringify(canal.grupos).replace(/"/g, '&quot;')})"`;
            btnText = 'Ver Grupos';
            btnIcon = 'ph-users';
        } else if (isGoogle) {
            btnText = 'Ver Calendário';
            btnIcon = 'ph-calendar';
        } else if (isMinecraft) {
            actionAttr = `onclick="copyIP(event, '${canal.ip}')"`;
            btnText = 'Copiar IP';
            btnIcon = 'ph-copy';
        }

        return `
            <div class="card glass community-card ${isMinecraft ? 'minecraft-card' : ''}">
                <div class="community-header">
                    <i class="ph ${canal.icone}" style="font-size: 2rem; color: var(--accent-color);"></i>
                    ${isMinecraft ? `<span class="version-badge">${canal.versao}</span>` : ''}
                </div>
                <h3>${canal.plataforma}</h3>
                <p>${canal.descricao}</p>
                ${isMinecraft ? `<div class="ip-display" id="minecraft-ip-box"><code>${canal.ip}</code></div>` : ''}
                <a href="${href}" ${actionAttr} target="${isWhatsApp || isMinecraft ? '_self' : '_blank'}" class="btn ${isMinecraft ? 'btn-primary btn-copy-feedback' : 'btn-secondary'}" style="width: 100%; justify-content: center; margin-top: auto;">
                    <i class="ph ${btnIcon}"></i> ${btnText}
                </a>
            </div>
        `;
    }).join('');
}

function copyIP(e, ip) {
    e.preventDefault();
    const btn = e.currentTarget;
    const ipBox = document.getElementById('minecraft-ip-box');
    
    const showFeedback = (success) => {
        if (success) {
            btn.classList.add('animating');
            btn.classList.add('success');
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="ph ph-check-circle"></i> IP Copiado!';
            if (ipBox) ipBox.classList.add('copied');

            setTimeout(() => {
                btn.classList.remove('animating');
                btn.innerHTML = originalContent;
                btn.classList.remove('success');
                if (ipBox) ipBox.classList.remove('copied');
            }, 2000);
        }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ip)
            .then(() => showFeedback(true))
            .catch(() => fallbackCopy(ip, showFeedback));
    } else {
        fallbackCopy(ip, showFeedback);
    }
}

function openWhatsAppModal(e, grupos) {
    e.preventDefault();
    const modal = document.getElementById('whatsapp-modal');
    const list = document.getElementById('whatsapp-groups-list');
    
    list.innerHTML = grupos.map(g => `
        <div class="card" style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border);">
            <h4>${g.nome}</h4>
            <p>${g.desc}</p>
            <a href="${g.link}" target="_blank" class="btn btn-primary" style="width: 100%; justify-content: center;">
                Baixar <i class="ph ph-whatsapp-logo"></i> Entrar
            </a>
        </div>
    `).join('');
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openMaterialsModal(materiaId) {
    const modal = document.getElementById('materials-modal');
    const title = document.getElementById('materials-modal-title');
    const list = document.getElementById('materials-list');
    
    let materia = null;
    academicData.forEach(semestre => {
        const found = semestre.materias.find(m => m.id === materiaId);
        if (found) materia = found;
    });

    if (!materia) return;

    title.innerHTML = `<i class="ph ph-books"></i> Materiais: ${materia.nome}`;
    
    if (!materia.materiais || materia.materiais.length === 0) {
        list.innerHTML = '<p class="empty-state">Nenhum material disponível ainda.</p>';
    } else {
        // Agrupar materiais por categoria
        const categorias = {};
        materia.materiais.forEach(mat => {
            const cat = mat.categoria || 'Outros';
            if (!categorias[cat]) categorias[cat] = [];
            categorias[cat].push(mat);
        });

        list.innerHTML = Object.keys(categorias).map(catName => `
            <div class="accordion-item modal-accordion active">
                <div class="accordion-header modal-accordion-header">
                    <h4>${catName}</h4>
                    <i class="ph ph-caret-down"></i>
                </div>
                <div class="accordion-content">
                    <div class="accordion-inner" style="padding: 10px 0;">
                        ${categorias[catName].map(mat => `
                            <div class="link-item" style="margin-bottom: 10px; background: rgba(255,255,255,0.02);">
                                <div class="link-info">
                                    <span class="link-name">${mat.nome}</span>
                                    <span class="link-desc">${mat.tipo || 'Arquivo'}</span>
                                </div>
                                <a href="${mat.url}" target="_blank" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.8rem;">
                                    <i class="ph ph-download-simple"></i> Baixar
                                </a>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');

        // Adicionar eventos para os novos acordeões do modal
        const modalHeaders = list.querySelectorAll('.modal-accordion-header');
        modalHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const item = header.parentElement;
                item.classList.toggle('active');
            });
        });
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMaterialsModal() {
    const modal = document.getElementById('materials-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function setupModal() {
    const whatsappModal = document.getElementById('whatsapp-modal');
    const materialsModal = document.getElementById('materials-modal');
    const avisoModal = document.getElementById('aviso-modal');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    closeBtns.forEach(btn => {
        btn.onclick = () => {
            whatsappModal.classList.remove('active');
            materialsModal.classList.remove('active');
            avisoModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
    });
    
    window.onclick = (event) => {
        if (event.target == whatsappModal || event.target == materialsModal || event.target == avisoModal) {
            whatsappModal.classList.remove('active');
            materialsModal.classList.remove('active');
            avisoModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };
}

function renderAcademico(semestres) {
    const container = document.getElementById('academico-container');
    container.innerHTML = semestres.map((s, index) => `
        <div class="accordion-item glass ${index === 0 ? 'active' : ''}">
            <div class="accordion-header">
                <h3>${s.semestre}</h3>
                <i class="ph ph-caret-down"></i>
            </div>
            <div class="accordion-content">
                <div class="accordion-inner">
                    <div class="grid-cards">
                        ${s.materias.map(m => `
                            <div class="card" style="background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border);">
                                <h4>${m.nome}</h4>
                                <p>Prof. ${m.professor}</p>
                                <div class="meta">
                                    <span class="status-badge status-${m.status.toLowerCase().replace(' ', '-').replace('í', 'i')}">${m.status}</span>
                                </div>
                                <div style="margin-top: 15px;">
                                    <button class="btn btn-secondary" style="width: 100%; justify-content: center; font-size: 0.8rem;" onclick="openMaterialsModal('${m.id}')">
                                        <i class="ph ph-folder-open"></i> Ver Materiais
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderAgenda(eventos) {
    const container = document.getElementById('agenda-container');
    if (!eventos || eventos.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                <i class="ph ph-calendar-x" style="font-size: 3rem; margin-bottom: 16px; display: block; opacity: 0.5;"></i>
                <p>Não há eventos ou provas marcadas para os próximos dias.</p>
            </div>
        `;
        return;
    }
    container.innerHTML = eventos.map((e, index) => {
        const date = new Date(e.data);
        const day = date.getDate() + 1;
        const month = date.toLocaleString('pt-br', { month: 'short' });
        const isNext = index === 0;
        
        return `
            <div class="list-item ${isNext ? 'next-event' : ''}">
                <div class="date-box">
                    <span class="day">${day}</span>
                    <span class="month">${month}</span>
                </div>
                <div class="event-info">
                    <h3>${e.evento} ${isNext ? '<span class="next-badge">PRÓXIMO</span>' : ''}</h3>
                    <p><i class="ph ph-map-pin"></i> ${e.local} • <i class="ph ph-clock"></i> ${e.horario}</p>
                </div>
                <div class="event-tag">
                    <span class="badge">${e.tipo}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderHorario(dias) {
    const container = document.getElementById('horario-container');
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const dayMap = { 1: "2ª Feira", 2: "3ª Feira", 3: "4ª Feira", 4: "5ª Feira", 5: "6ª Feira" };
    const currentDayStr = dayMap[dayOfWeek];

    container.innerHTML = dias.map(d => {
        const isActive = d.dia === currentDayStr;
        return `
            <div class="card glass timetable-card ${isActive ? 'active-day' : ''}">
                <h3 class="day-title">${d.dia} ${isActive ? '<span class="today-badge">HOJE</span>' : ''}</h3>
                <div class="classes-list">
                    ${d.aulas.map(a => `
                        <div class="class-item">
                            <span class="class-time">${a.hora}</span>
                            <div class="class-details">
                                <span class="class-name">${a.materia}</span>
                                <span class="class-room"><i class="ph ph-door"></i> ${a.sala}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

function renderLinks(categorias) {
    const container = document.getElementById('links-container');
    if (categorias.length === 0) {
        container.innerHTML = '<p class="empty-state" style="grid-column: 1/-1;">Nenhum link encontrado para sua busca.</p>';
        return;
    }
    container.innerHTML = categorias.map(cat => `
        <div class="card glass link-category-card" style="border-top: 4px solid ${cat.cor};">
            <div class="category-header">
                <i class="ph ${cat.icone}" style="color: ${cat.cor}; font-size: 1.5rem;"></i>
                <h3>${cat.categoria}</h3>
            </div>
            <div class="links-list">
                ${cat.links.map(l => {
                    const isCopy = l.url.startsWith('copy:');
                    const displayUrl = isCopy ? '#' : l.url;
                    const copyData = isCopy ? `data-copy="${l.url.replace('copy:', '')}"` : '';
                    const classList = `link-item ${isCopy ? 'btn-copy-js' : ''}`;
                    
                    return `
                        <a href="${displayUrl}" ${copyData} target="${isCopy ? '_self' : '_blank'}" class="${classList}">
                            <div class="link-info">
                                <span class="link-name">${l.nome}</span>
                                <span class="link-desc">${l.desc}</span>
                            </div>
                            <i class="ph ${isCopy ? 'ph-copy' : 'ph-arrow-square-out'}"></i>
                        </a>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function renderContribuintes(membros) {
    const container = document.getElementById('contribuintes-container');
    if (!membros || membros.length === 0) return;

    container.innerHTML = membros.map(m => `
        <div class="contributor-card glass">
            <div class="contributor-avatar">
                <img src="${m.avatar}" alt="${m.nome}">
            </div>
            <div class="contributor-info">
                <h4>${m.nome}</h4>
                <p class="contributor-role">${m.cargo}</p>
                <div class="contributor-socials">
                    <a href="${m.github}" target="_blank" class="social-link github" title="GitHub">
                        <i class="ph ph-github-logo"></i>
                    </a>
                    <a href="${m.instagram}" target="_blank" class="social-link instagram" title="Instagram">
                        <i class="ph ph-instagram-logo"></i>
                    </a>
                </div>
            </div>
        </div>
    `).join('') + `
        <div class="contributor-card glass add-contributor-card">
            <div class="contributor-avatar add-avatar">
                <i class="ph ph-plus"></i>
            </div>
            <div class="contributor-info">
                <h4>Sua vez?</h4>
                <p>Contribua com materiais ou código.</p>
                <a href="https://github.com/blnkDev/ccpbag2026" target="_blank" class="btn-minimal">
                    Ver Repositório <i class="ph ph-arrow-right"></i>
                </a>
            </div>
        </div>
    `;
}

// Event Delegation para links de cópia
document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy-js');
    if (copyBtn) {
        e.preventDefault();
        const textToCopy = copyBtn.getAttribute('data-copy');
        if (textToCopy) {
            copyToClipboard(e, textToCopy, copyBtn);
        }
    }
});

function copyToClipboard(e, text, targetElement) {
    const linkItem = targetElement || e.currentTarget;
    const icon = linkItem.querySelector('i');
    const nameSpan = linkItem.querySelector('.link-name');
    
    if (!nameSpan || !icon) return;

    const originalName = nameSpan.textContent;
    const originalIconClass = icon.className;

    // Função interna para aplicar o feedback visual
    const showFeedback = (success) => {
        if (success) {
            linkItem.style.borderColor = 'var(--success-color)';
            linkItem.style.background = 'rgba(59, 165, 92, 0.1)';
            nameSpan.textContent = 'Copiado com sucesso!';
            nameSpan.style.color = 'var(--success-color)';
            icon.className = 'ph ph-check-circle';
            icon.style.color = 'var(--success-color)';
        } else {
            linkItem.style.borderColor = 'var(--danger-color)';
            nameSpan.textContent = 'Erro ao copiar';
            nameSpan.style.color = 'var(--danger-color)';
        }

        setTimeout(() => {
            linkItem.style.borderColor = 'transparent';
            linkItem.style.background = 'rgba(255, 255, 255, 0.03)';
            nameSpan.textContent = originalName;
            nameSpan.style.color = 'var(--text-primary)';
            icon.className = originalIconClass;
            icon.style.color = 'var(--text-secondary)';
        }, 2000);
    };

    // Tenta usar a API moderna primeiro
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => showFeedback(true))
            .catch(() => fallbackCopy(text, showFeedback));
    } else {
        fallbackCopy(text, showFeedback);
    }
}

function fallbackCopy(text, callback) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Assegura que o textarea não seja visível mas esteja no DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        callback(successful);
    } catch (err) {
        console.error('Fallback: Erro ao copiar', err);
        callback(false);
    }
}

function setupAccordions() {
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        });
    });
}

function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
}
