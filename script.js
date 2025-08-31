class ObsidianMinimal {
    constructor() {
        this.notes = this.loadNotes();
        this.currentNoteId = null;
        this.initializeElements();
        this.setupEventListeners();
        this.renderNotesList();
        this.setupAutoSave();
    }

    initializeElements() {
        this.notesList = document.getElementById('notes-list');
        this.noteTitle = document.getElementById('note-title');
        this.noteContent = document.getElementById('note-content');
        this.preview = document.getElementById('preview');
        this.searchInput = document.getElementById('search-notes');
        this.newNoteBtn = document.getElementById('new-note');
    }

    setupEventListeners() {
        this.newNoteBtn.addEventListener('click', () => this.createNote());
        this.noteTitle.addEventListener('input', () => this.saveCurrentNote());
        this.noteContent.addEventListener('input', () => this.saveCurrentNote());
        this.searchInput.addEventListener('input', () => this.filterNotes());
        
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
            // Nova tecla de atalho: Ctrl + X para deletar sem confirmação
            if (e.ctrlKey && e.key === 'x') {
                e.preventDefault();
                this.deleteNoteWithShortcut();
            }
        });
    }

    loadNotes() {
        const saved = localStorage.getItem('obsidian-notes');
        return saved ? JSON.parse(saved) : [];
    }

    saveNotes() {
        localStorage.setItem('obsidian-notes', JSON.stringify(this.notes));
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

    deleteNote(noteId) {
        this.notes = this.notes.filter(note => note.id !== noteId);
        this.saveNotes();
        
        if (this.currentNoteId === noteId) {
            this.currentNoteId = null;
            this.noteTitle.value = '';
            this.noteContent.value = '';
            this.updatePreview();
        }
        
        this.renderNotesList();
    }

    deleteNoteWithShortcut() {
        if (!this.currentNoteId) {
            // Opcional: mostrar mensagem de erro
            console.log('Nenhuma nota selecionada para deletar.');
            return;
        }
        
        // Deleta diretamente sem confirmação
        this.deleteNote(this.currentNoteId);
    }

    renderNotesList() {
        const searchTerm = this.searchInput.value.toLowerCase();
        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            note.content.toLowerCase().includes(searchTerm)
        );

        this.notesList.innerHTML = '';

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