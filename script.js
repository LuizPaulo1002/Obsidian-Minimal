class ObsidianMinimal {
    constructor() {
        this.notes = this.loadNotes();
        this.trash = this.loadTrash();
        this.currentNoteId = null;
        this.showingTrash = false;
        this.lastDeletedNote = null; 
        this.initializeElements();
        this.setupEventListeners();
        this.renderNotesList();
        this.setupAutoSave();
        this.updateTrashCount();
    }

    initializeElements() {
        this.notesList = document.getElementById('notes-list');
        this.noteTitle = document.getElementById('note-title');
        this.noteContent = document.getElementById('note-content');
        this.preview = document.getElementById('preview');
        this.searchInput = document.getElementById('search-notes');
        this.newNoteBtn = document.getElementById('new-note');
        this.toggleTrashBtn = document.getElementById('toggle-trash');
        this.trashCount = document.getElementById('trash-count');
    }

    setupEventListeners() {
        this.newNoteBtn.addEventListener('click', () => this.createNote());
        this.noteTitle.addEventListener('input', () => this.saveCurrentNote());
        this.noteContent.addEventListener('input', () => this.saveCurrentNote());
        this.searchInput.addEventListener('input', () => this.filterNotes());
        this.toggleTrashBtn.addEventListener('click', () => this.toggleTrashView());
        
        // Teclas de atalho
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveCurrentNote();
            }
            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.createNote();
            }

            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                this.moveToTrash();
            }
            // Ctrl + Z para desfazer (restaurar última nota deletada)
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undoLastDelete();
            }
        });
    }

    loadNotes() {
        const saved = localStorage.getItem('obsidian-notes');
        return saved ? JSON.parse(saved) : [];
    }

    loadTrash() {
        const saved = localStorage.getItem('obsidian-trash');
        return saved ? JSON.parse(saved) : [];
    }

    saveNotes() {
        localStorage.setItem('obsidian-notes', JSON.stringify(this.notes));
    }

    saveTrash() {
        localStorage.setItem('obsidian-trash', JSON.stringify(this.trash));
    }

    updateTrashCount() {
        this.trashCount.textContent = this.trash.length;
    }

    createNote() {
        const newNote = {
            id: Date.now().toString(),
            title: 'Nova Nota',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.notes.unshift(newNote);
        this.saveNotes();
        this.renderNotesList();
        this.selectNote(newNote.id);
    }

    selectNote(noteId) {
        this.currentNoteId = noteId;
        const note = this.notes.find(n => n.id === noteId);
        
        if (note) {
            this.noteTitle.value = note.title || '';
            this.noteContent.value = note.content || '';
            this.updatePreview();
            this.renderNotesList();
        }
    }

    saveCurrentNote() {
        if (!this.currentNoteId) return;

        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (note) {
            note.title = this.noteTitle.value;
            note.content = this.noteContent.value;
            note.updatedAt = new Date().toISOString();
            this.saveNotes();
            this.renderNotesList();
        }
    }

    moveToTrash() {
        if (!this.currentNoteId) {
            console.log('Nenhuma nota selecionada para mover para lixeira.');
            return;
        }
        
        const noteIndex = this.notes.findIndex(n => n.id === this.currentNoteId);
        if (noteIndex !== -1) {
            const note = this.notes.splice(noteIndex, 1)[0];
            note.deletedAt = new Date().toISOString();
            this.trash.push(note);
            
            // Salva a nota deletada para poder desfazer
            this.lastDeletedNote = {
                note: note,
                originalIndex: noteIndex
            };
            
            this.saveNotes();
            this.saveTrash();
            this.updateTrashCount();
            
            // Limpa o editor
            this.currentNoteId = null;
            this.noteTitle.value = '';
            this.noteContent.value = '';
            this.updatePreview();
            
            this.renderNotesList();
        }
    }

    undoLastDelete() {
        if (!this.lastDeletedNote) {
            console.log('Nenhuma ação para desfazer.');
            return;
        }
        
        const noteToRestore = this.lastDeletedNote.note;
        const originalIndex = this.lastDeletedNote.originalIndex;
        
        // Remove da lixeira
        const trashIndex = this.trash.findIndex(n => n.id === noteToRestore.id);
        if (trashIndex !== -1) {
            this.trash.splice(trashIndex, 1);
        }
        
        // Restaura para a posição original
        delete noteToRestore.deletedAt;
        noteToRestore.updatedAt = new Date().toISOString();
        
        if (originalIndex >= this.notes.length) {
            this.notes.push(noteToRestore);
        } else {
            this.notes.splice(originalIndex, 0, noteToRestore);
        }
        
        this.saveNotes();
        this.saveTrash();
        this.updateTrashCount();
        
        // Seleciona a nota restaurada
        this.selectNote(noteToRestore.id);
        
        // Limpa o histórico de desfazer
        this.lastDeletedNote = null;
        
        this.renderNotesList();
    }

    restoreFromTrash(noteId) {
        const trashIndex = this.trash.findIndex(n => n.id === noteId);
        if (trashIndex !== -1) {
            const note = this.trash.splice(trashIndex, 1)[0];
            delete note.deletedAt;
            note.updatedAt = new Date().toISOString();
            this.notes.unshift(note);
            this.saveNotes();
            this.saveTrash();
            this.updateTrashCount();
            this.renderNotesList();
        }
    }

    permanentlyDelete(noteId) {
        const trashIndex = this.trash.findIndex(n => n.id === noteId);
        if (trashIndex !== -1) {
            this.trash.splice(trashIndex, 1);
            this.saveTrash();
            this.updateTrashCount();
            this.renderNotesList();
        }
    }

    emptyTrash() {
        if (this.trash.length === 0) return;
        
        if (confirm(`Deseja permanentemente deletar ${this.trash.length} nota(s) da lixeira?`)) {
            this.trash = [];
            this.saveTrash();
            this.updateTrashCount();
            this.renderNotesList();
        }
    }

    toggleTrashView() {
        this.showingTrash = !this.showingTrash;
        this.renderNotesList();
        this.toggleTrashBtn.innerHTML = this.showingTrash ? 
            'Notas (<span id="trash-count">' + this.trash.length + '</span>)' : 
            'Lixeira (<span id="trash-count">' + this.trash.length + '</span>)';
    }

    renderNotesList() {
        const searchTerm = this.searchInput.value.toLowerCase();
        
        if (this.showingTrash) {
            this.renderTrashList(searchTerm);
        } else {
            this.renderActiveNotesList(searchTerm);
        }
    }

    renderActiveNotesList(searchTerm) {
        let filteredNotes = this.notes;
        if (searchTerm) {
            filteredNotes = this.notes.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            );
        }

        this.notesList.innerHTML = '';

        if (filteredNotes.length === 0) {
            this.notesList.innerHTML = '<div class="empty-trash"><p>Nenhuma nota encontrada</p></div>';
            return;
        }

        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = `note-item ${note.id === this.currentNoteId ? 'active' : ''}`;
            noteElement.innerHTML = `
                <h3>${note.title || 'Sem título'}</h3>
                <div class="preview">${this.getPreviewText(note.content)}</div>
                <div class="date">${this.formatDate(note.updatedAt)}</div>
            `;
            
            noteElement.addEventListener('click', () => this.selectNote(note.id));

            this.notesList.appendChild(noteElement);
        });
    }

    renderTrashList(searchTerm) {
        let filteredTrash = this.trash;
        if (searchTerm) {
            filteredTrash = this.trash.filter(note => 
                note.title.toLowerCase().includes(searchTerm) || 
                note.content.toLowerCase().includes(searchTerm)
            );
        }

        this.notesList.innerHTML = '';

        if (filteredTrash.length === 0) {
            this.notesList.innerHTML = `
                <div class="empty-trash">
                    <p>Lixeira vazia</p>
                    <button onclick="app.emptyTrash()" style="display:none;">Esvaziar lixeira</button>
                </div>
            `;
            return;
        }

        const emptyTrashBtn = document.createElement('div');
        emptyTrashBtn.className = 'empty-trash';
        emptyTrashBtn.innerHTML = `
            <button onclick="app.emptyTrash()">Esvaziar lixeira (${filteredTrash.length})</button>
        `;
        this.notesList.appendChild(emptyTrashBtn);

        filteredTrash.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-item trash-item';
            noteElement.innerHTML = `
                <h3>${note.title || 'Sem título'}</h3>
                <div class="preview">${this.getPreviewText(note.content)}</div>
                <div class="date">Deletado: ${this.formatDate(note.deletedAt)}</div>
                <div class="trash-actions">
                    <button class="restore" onclick="event.stopPropagation(); app.restoreFromTrash('${note.id}')">.Restaurar</button>
                    <button class="delete" onclick="event.stopPropagation(); app.permanentlyDelete('${note.id}')">.Deletar</button>
                </div>
            `;
            
            noteElement.addEventListener('click', () => {
                // Mostra detalhes da nota deletada no editor
                this.noteTitle.value = note.title || '';
                this.noteContent.value = note.content || '';
                this.updatePreview();
            });

            this.notesList.appendChild(noteElement);
        });
    }

    getPreviewText(content) {
        if (!content) return '';
        return content.substring(0, 100) + (content.length > 100 ? '...' : '');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    }

    filterNotes() {
        this.renderNotesList();
    }

    updatePreview() {
        const content = this.noteContent.value;
        this.preview.innerHTML = this.markdownToHtml(content);
        this.preview.classList.add('active');
    }

    markdownToHtml(text) {
        // Converte **negrito**
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Converte *itálico*
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Converte # Títulos
        text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        
        // Converte links internos [[Nota]]
        text = text.replace(/\[\[(.*?)\]\]/g, '<a href="#" class="internal-link" onclick="app.selectNoteByTitle(\'$1\')">$1</a>');
        
        // Converte links normais [texto](url)
        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Converte parágrafos
        text = text.replace(/\n\n/g, '</p><p>');
        text = '<p>' + text + '</p>';
        text = text.replace(/<p><\/p>/g, '');
        
        return text;
    }

    selectNoteByTitle(title) {
        const note = this.notes.find(n => n.title === title);
        if (note) {
            this.selectNote(note.id);
        } else {
            // Cria nova nota se não existir
            const newNote = {
                id: Date.now().toString(),
                title: title,
                content: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.notes.unshift(newNote);
            this.saveNotes();
            this.renderNotesList();
            this.selectNote(newNote.id);
        }
    }

    setupAutoSave() {
        setInterval(() => {
            this.saveCurrentNote();
        }, 30000); // Salva a cada 30 segundos
    }
}

// Inicializa a aplicação
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ObsidianMinimal();
});