/**
 * Main application logic for the Resume Generator.
 * Manages state, UI updates, and data persistence.
 */
const app = (function() {
    // Application state object
    let state = {
        contact: {
            fullName: '',
            role: '',
            email: '',
            phone: '',
            location: '',
            linkedin: '',
            github: '',
            portfolio: ''
        },
        summary: '',
        experience: [],
        projects: [],
        skills: [],
        education: [],
        achievements: '',
        certifications: '',
        otherDetails: ''
    };

    const selectors = {
        form: '#resumeForm',
        preview: '#resume-preview',
        jsonInput: '#json-input',
        // Buttons
        saveDraftBtn: '#saveDraftBtn',
        loadDraftBtn: '#loadDraftBtn',
        resetBtn: '#resetBtn',
        downloadPdfBtn: '#downloadPdfBtn',
        exportJsonBtn: '#exportJsonBtn',
        importJsonBtn: '#importJsonBtn',
        // Containers
        experienceContainer: '#experience-container',
        projectsContainer: '#projects-container',
        skillsContainer: '#skills-container',
        educationContainer: '#education-container',
    };

    const elements = {};

    // Seed data for initial demo
    const seedData = {
        contact: {
            fullName: 'Jane Doe',
            role: 'Senior Software Engineer',
            email: 'jane.doe@example.com',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            linkedin: 'linkedin.com/in/janedoe',
            github: 'github.com/janedoe',
            portfolio: 'janedoe.dev'
        },
        summary: 'Highly motivated and results-oriented Senior Software Engineer with 8+ years of experience designing and developing scalable web applications. Proficient in JavaScript, Node.js, and React, with a strong background in agile methodologies and CI/CD pipelines. Seeking to leverage my technical expertise and leadership skills to drive innovation at a dynamic tech company.',
        experience: [
            {
                company: 'Tech Solutions Inc.',
                role: 'Senior Software Engineer',
                location: 'San Francisco, CA',
                startDate: 'Jan 2022',
                endDate: 'Present',
                bullets: [
                    'Led a team of 4 engineers to develop a new microservice architecture, reducing latency by 30%.',
                    'Architected and implemented a robust API gateway using Node.js and Express, handling over 10 million daily requests.',
                    'Mentored junior developers and conducted code reviews, improving code quality and team efficiency.'
                ]
            },
            {
                company: 'Innovate Labs',
                role: 'Software Engineer',
                location: 'Austin, TX',
                startDate: 'Jun 2018',
                endDate: 'Dec 2021',
                bullets: [
                    'Developed and maintained front-end components using React and Redux, resulting in a 25% faster user interface.',
                    'Collaborated with product managers to define project requirements and deliver features on time.'
                ]
            }
        ],
        projects: [
            {
                name: 'Resume Generator App',
                link: 'github.com/janedoe/resume-generator',
                techStack: 'HTML, CSS, JavaScript',
                bullets: [
                    'Built a single-page application from scratch for creating and exporting resumes.',
                    'Implemented dynamic form-to-preview synchronization and data persistence via LocalStorage.'
                ]
            },
            {
                name: 'Personal Blog',
                link: 'janedoe.dev/blog',
                techStack: 'Node.js, Express, MongoDB, EJS',
                bullets: [
                    'Developed a full-stack blog platform with a custom CMS for content management.',
                    'Integrated user authentication and a comment system.'
                ]
            }
        ],
        skills: [
            { group: 'Languages', items: 'JavaScript (ES6+), Python, HTML5, CSS3' },
            { group: 'Frameworks & Libraries', items: 'React, Node.js, Express.js, Redux, jQuery' },
            { group: 'Tools & Platforms', items: 'Git, Docker, AWS, Heroku, Webpack' }
        ],
        education: [
            {
                degree: 'M.S. in Computer Science',
                school: 'Stanford University',
                year: '2018',
                grade: '4.0/4.0 GPA'
            },
            {
                degree: 'B.S. in Computer Engineering',
                school: 'University of Texas at Austin',
                year: '2016',
                grade: 'Magna Cum Laude'
            }
        ],
        achievements: 'Winner, Tech Innovator Hackathon (2020)\nPublished "Scalable Microservices with Node.js" in Journal of Software Engineering',
        certifications: 'AWS Certified Solutions Architect – Associate (2021)\nProject Management Professional (PMP) (2020)',
        otherDetails: 'Volunteer at Code for Good (2019-Present)\nLed technical workshops for local high school students.'
    };

    /**
     * Initializes the application.
     */
    function init() {
        cacheSelectors();
        bindEvents();
        loadInitialState();
        renderAll();
    }

    /**
     * Caches DOM elements for efficient access.
     */
    function cacheSelectors() {
        for (const key in selectors) {
            elements[key] = document.querySelector(selectors[key]);
        }
    }

    /**
     * Binds all event listeners.
     */
    function bindEvents() {
        elements.form.addEventListener('input', handleFormInput);
        elements.form.addEventListener('click', handleFormClick);
        elements.form.addEventListener('dragstart', handleDragStart);
        elements.form.addEventListener('dragover', handleDragOver);
        elements.form.addEventListener('drop', handleDrop);
        elements.form.addEventListener('click', toggleAccordion);

        elements.saveDraftBtn.addEventListener('click', saveState);
        elements.loadDraftBtn.addEventListener('click', () => loadState(true));
        elements.resetBtn.addEventListener('click', resetState);
        elements.downloadPdfBtn.addEventListener('click', downloadPdf);
        elements.exportJsonBtn.addEventListener('click', exportJson);
        elements.importJsonBtn.addEventListener('click', () => elements.jsonInput.click());
        elements.jsonInput.addEventListener('change', importJson);
    }

    /**
     * Loads the initial state, trying LocalStorage first, then falling back to seed data.
     */
    function loadInitialState() {
        const savedState = localStorage.getItem('resumeData');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                Object.assign(state, parsedState);
                fillForm();
            } catch (e) {
                console.error("Failed to load state from LocalStorage. Using seed data.", e);
                Object.assign(state, seedData);
            }
        } else {
            Object.assign(state, seedData);
        }
    }

    /**
     * Fills the form inputs with data from the current state object.
     */
    function fillForm() {
        // Fill simple inputs
        for (const key in state.contact) {
            const input = document.getElementById(key);
            if (input) input.value = state.contact[key];
        }
        document.getElementById('summary').value = state.summary;
        document.getElementById('achievements').value = state.achievements;
        document.getElementById('certifications').value = state.certifications;
        document.getElementById('otherDetails').value = state.otherDetails;
    }

    /**
     * Handles all form input changes to update the state and preview.
     * @param {Event} event 
     */
    function handleFormInput(event) {
        const { target } = event;
        const parentAccordion = target.closest('.accordion-item');
        let section = parentAccordion ? parentAccordion.querySelector('h2').textContent.split(' ')[0].toLowerCase() : null;

        if (target.id === 'summary' || target.id === 'achievements' || target.id === 'certifications' || target.id === 'otherDetails') {
            state[target.id] = target.value;
        } else if (target.closest('.accordion-item').querySelector('h2').textContent.includes('Contact')) {
            state.contact[target.id] = target.value;
        } else if (target.closest('.form-item')) {
            const index = target.closest('.form-item').dataset.index;
            const field = target.name.split('-')[1] || target.name;
            const parent = target.closest('.form-item').dataset.parent;

            if (field === 'bullets') {
                state[parent][index][field] = target.value.split('\n').filter(Boolean);
            } else if (field === 'items') {
                state[parent][index][field] = target.value;
            } else {
                state[parent][index][field] = target.value;
            }
        }
        
        saveState();
        renderAll();
    }

    /**
     * Handles button clicks within the form (add/delete/move).
     * @param {Event} event
     */
    function handleFormClick(event) {
        const { target } = event;
        if (target.classList.contains('btn-add-item')) {
            addItem(target.dataset.section);
        } else if (target.classList.contains('btn-delete')) {
            deleteItem(target.dataset.parent, target.dataset.index);
        } else if (target.classList.contains('btn-move-up') || target.classList.contains('btn-move-down')) {
            moveItem(target.dataset.parent, target.dataset.index, target.classList.contains('btn-move-up') ? 'up' : 'down');
        }
    }

    /**
     * Toggles accordion sections.
     * @param {Event} event
     */
    function toggleAccordion(event) {
        const header = event.target.closest('.accordion-header');
        if (header) {
            const item = header.closest('.accordion-item');
            item.classList.toggle('open');
        }
    }

    /**
     * Adds a new item to a section.
     * @param {string} section 
     */
    function addItem(section) {
        let newItem = {};
        switch (section) {
            case 'experience':
                newItem = { company: '', role: '', location: '', startDate: '', endDate: '', bullets: [''] };
                break;
            case 'projects':
                newItem = { name: '', link: '', techStack: '', bullets: [''] };
                break;
            case 'skills':
                newItem = { group: '', items: '' };
                break;
            case 'education':
                newItem = { degree: '', school: '', year: '', grade: '' };
                break;
        }
        state[section].push(newItem);
        renderFormSection(section);
        saveState();
        renderAll();
    }

    /**
     * Deletes an item from a section.
     * @param {string} section
     * @param {number} index
     */
    function deleteItem(section, index) {
        if (confirm('Are you sure you want to delete this item?')) {
            state[section].splice(index, 1);
            renderFormSection(section);
            saveState();
            renderAll();
        }
    }
    
    /**
     * Moves an item up or down in a section.
     * @param {string} section
     * @param {number} index
     * @param {string} direction
     */
    function moveItem(section, index, direction) {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < state[section].length) {
            const itemToMove = state[section].splice(index, 1)[0];
            state[section].splice(newIndex, 0, itemToMove);
            renderFormSection(section);
            saveState();
            renderAll();
        }
    }

    // --- Drag and Drop Logic ---
    let dragSrcElement = null;

    function handleDragStart(e) {
        if (!e.target.closest('.form-item')) return;
        dragSrcElement = e.target.closest('.form-item');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', dragSrcElement.outerHTML);
        dragSrcElement.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const target = e.target.closest('.form-item');
        if (target && target !== dragSrcElement) {
            const container = dragSrcElement.parentElement;
            const rect = target.getBoundingClientRect();
            const isAfter = e.clientY > rect.top + rect.height / 2;
            container.insertBefore(dragSrcElement, isAfter ? target.nextSibling : target);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        const container = dragSrcElement.parentElement;
        const newOrder = Array.from(container.children)
            .filter(el => el.classList.contains('form-item'))
            .map(el => {
                const parent = el.dataset.parent;
                const index = el.dataset.index;
                return state[parent][index];
            });

        const parent = dragSrcElement.dataset.parent;
        state[parent] = newOrder;
        
        dragSrcElement.classList.remove('dragging');
        renderFormSection(parent);
        saveState();
        renderAll();
    }
    
    // --- Rendering Functions ---

    /**
     * Renders all form and preview sections.
     */
    function renderAll() {
        renderForm();
        renderPreview();
    }

    /**
     * Renders the dynamic form sections.
     */
    function renderForm() {
        renderFormSection('experience');
        renderFormSection('projects');
        renderFormSection('skills');
        renderFormSection('education');
    }
    
    /**
     * Renders a specific dynamic form section based on the state.
     * @param {string} section
     */
    function renderFormSection(section) {
        const container = elements[`${section}Container`];
        let html = '';
        state[section].forEach((item, index) => {
            html += generateFormItemHtml(item, section, index);
        });
        container.innerHTML = html + container.querySelector('.add-item-container').outerHTML;
    }

    /**
     * Generates HTML for a single form item.
     * @param {object} item
     * @param {string} section
     * @param {number} index
     * @returns {string}
     */
    function generateFormItemHtml(item, section, index) {
        const moveButtons = `<button type="button" class="btn-icon btn-move-up" data-parent="${section}" data-index="${index}" title="Move Up">▲</button>
                             <button type="button" class="btn-icon btn-move-down" data-parent="${section}" data-index="${index}" title="Move Down">▼</button>`;
        const deleteButton = `<button type="button" class="btn-icon btn-delete" data-parent="${section}" data-index="${index}" title="Delete">❌</button>`;
        
        let fieldsHtml = '';
        if (section === 'experience' || section === 'projects') {
            fieldsHtml = `
                <div class="form-group">
                    <label>Bullets <small>(separate with new lines)</small></label>
                    <textarea name="${section}-bullets" rows="4">${item.bullets.join('\n')}</textarea>
                </div>
            `;
        } else if (section === 'skills') {
            fieldsHtml = `
                <div class="form-group">
                    <label>Items <small>(e.g., JavaScript, Python, etc.)</small></label>
                    <input type="text" name="${section}-items" value="${item.items}">
                </div>
            `;
        }

        const title = item.name || item.company || item.group || item.school || 'New Item';
        const dragHandle = `<div class="drag-handle" draggable="true" title="Drag to reorder">☰</div>`;

        return `
            <div class="form-item" data-parent="${section}" data-index="${index}" draggable="true">
                <div class="form-item-header">
                    <h3>${title}</h3>
                    <div class="form-item-actions">
                        ${moveButtons}
                        ${deleteButton}
                    </div>
                </div>
                ${Object.keys(item).filter(key => key !== 'bullets').map(key => `
                    <div class="form-group">
                        <label>${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                        <input type="text" name="${section}-${key}" value="${item[key]}">
                    </div>
                `).join('')}
                ${fieldsHtml}
            </div>
        `;
    }

    /**
     * Renders the entire resume preview based on the state.
     */
    function renderPreview() {
        document.getElementById('preview-contact').innerHTML = renderContact();
        document.getElementById('preview-summary').innerHTML = renderSection('Summary', 'summary');
        document.getElementById('preview-experience').innerHTML = renderSection('Experience', 'experience');
        document.getElementById('preview-projects').innerHTML = renderSection('Projects', 'projects');
        document.getElementById('preview-skills').innerHTML = renderSection('Skills', 'skills');
        document.getElementById('preview-education').innerHTML = renderSection('Education', 'education');
        document.getElementById('preview-achievements').innerHTML = renderSection('Achievements', 'achievements');
        document.getElementById('preview-certifications').innerHTML = renderSection('Certifications', 'certifications');
        document.getElementById('preview-otherDetails').innerHTML = renderSection('Other Details', 'otherDetails');
    }

    /**
     * Renders the Contact section.
     * @returns {string}
     */
    function renderContact() {
        const { fullName, role, email, phone, location, linkedin, github, portfolio } = state.contact;
        if (!fullName || !email) return '';

        const links = [
            phone,
            location,
            linkedin ? `<a href="https://${linkedin}" target="_blank">${linkedin.replace('https://', '')}</a>` : null,
            github ? `<a href="https://${github}" target="_blank">${github.replace('https://', '')}</a>` : null,
            portfolio ? `<a href="https://${portfolio}" target="_blank">${portfolio.replace('https://', '')}</a>` : null,
            email ? `<a href="mailto:${email}">${email}</a>` : null,
        ].filter(Boolean).join(' | ');

        return `
            <div class="resume-header">
                <h1>${fullName}</h1>
                ${role ? `<h2>${role}</h2>` : ''}
                <p class="contact-info">${links}</p>
            </div>
        `;
    }

    /**
     * Renders a generic section with a title and content.
     * @param {string} title
     * @param {string} key
     * @returns {string}
     */
    function renderSection(title, key) {
        if (!state[key] || (Array.isArray(state[key]) && state[key].length === 0)) return '';

        let content = '';
        if (typeof state[key] === 'string') {
            content = `<p>${state[key].replace(/\n/g, '<br>')}</p>`;
        } else if (Array.isArray(state[key])) {
            content = `<ul class="resume-list">`;
            state[key].forEach(item => {
                content += generatePreviewItemHtml(item, key);
            });
            content += `</ul>`;
        }

        return `
            <h2>${title}</h2>
            ${content}
        `;
    }

    /**
     * Generates HTML for a single preview item.
     * @param {object} item
     * @param {string} section
     * @returns {string}
     */
    function generatePreviewItemHtml(item, section) {
        if (section === 'experience' || section === 'projects') {
            const title = section === 'experience' ? item.role : item.name;
            const subtitle = section === 'experience' ? item.company : (item.link ? `<a href="https://${item.link}" target="_blank">${item.techStack}</a>` : item.techStack);
            const locationDates = section === 'experience' ? `${item.location} | ${item.startDate} – ${item.endDate}` : '';
            const bulletsHtml = item.bullets && item.bullets.length > 0
                ? `<ul class="resume-list-bullets">${item.bullets.map(b => `<li>${b}</li>`).join('')}</ul>`
                : '';
            
            return `
                <li class="resume-list-item">
                    <div class="resume-item-header">
                        <span class="title">${title}</span>
                        <span class="location-dates">${locationDates}</span>
                    </div>
                    ${subtitle ? `<div>${subtitle}</div>` : ''}
                    ${bulletsHtml}
                </li>
            `;
        } else if (section === 'skills') {
            return `
                <li class="resume-skills-group">
                    <h3>${item.group}:</h3> <span>${item.items}</span>
                </li>
            `;
        } else if (section === 'education') {
            return `
                <li class="resume-list-item">
                    <div class="resume-item-header">
                        <span class="title">${item.degree}</span>
                        <span class="location-dates">${item.year}</span>
                    </div>
                    <div>${item.school}</div>
                    ${item.grade ? `<div>${item.grade}</div>` : ''}
                </li>
            `;
        }
    }

    // --- Data Persistence and Export ---

    /**
     * Saves the current state to LocalStorage.
     */
    function saveState() {
        localStorage.setItem('resumeData', JSON.stringify(state));
    }

    /**
     * Loads state from LocalStorage.
     * @param {boolean} confirmReload
     */
    function loadState(confirmReload = false) {
        if (confirmReload && !confirm('Loading a draft will overwrite your current data. Continue?')) {
            return;
        }
        const savedState = localStorage.getItem('resumeData');
        if (savedState) {
            Object.assign(state, JSON.parse(savedState));
            fillForm();
            renderAll();
            alert('Draft loaded successfully!');
        } else {
            alert('No saved draft found.');
        }
    }

    /**
     * Resets the application state to the initial seed data.
     */
    function resetState() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('resumeData');
            Object.assign(state, seedData);
            fillForm();
            renderAll();
            alert('Resume data reset successfully!');
        }
    }

    /**
     * Exports the current state as a JSON file.
     */
    function exportJson() {
        const dataStr = JSON.stringify(state, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', 'resume_data.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Imports state from a JSON file.
     * @param {Event} event
     */
    function importJson(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedState = JSON.parse(e.target.result);
                Object.assign(state, importedState);
                fillForm();
                renderAll();
                alert('JSON data imported successfully!');
            } catch (error) {
                alert('Invalid JSON file.');
            }
        };
        reader.readAsText(file);
    }

    /**
     * Downloads the preview as a PDF.
     */
    async function downloadPdf() {
        window.print();
        // A more complex client-side PDF generation using html2canvas and jsPDF
        // This is a "nice to have" alternative and is commented out
        // as window.print() is more reliable for styling.
        /*
        const { jsPDF } = window.jspdf;
        const previewElement = document.getElementById('resume-preview');
        
        const originalWidth = previewElement.offsetWidth;
        const originalHeight = previewElement.offsetHeight;

        // Temporarily adjust for rendering
        previewElement.style.width = '210mm';
        previewElement.style.height = '297mm';
        
        const canvas = await html2canvas(previewElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('resume.pdf');
        
        // Restore original size
        previewElement.style.width = originalWidth + 'px';
        previewElement.style.height = originalHeight + 'px';
        */
    }

    return {
        init: init
    };
})();

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', app.init);