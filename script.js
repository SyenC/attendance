document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Screens
    const attendanceScreen = document.getElementById('attendance-screen');
    const coursesScreen = document.getElementById('courses-screen');
    const sectionsScreen = document.getElementById('sections-screen');
    const classScreen = document.getElementById('class-screen');
    
    // DOM Elements - PIN Entry
    const pinDisplay = document.getElementById('pin-display');
    const pinButtons = document.querySelectorAll('.pin-button');
    const checkButton = document.getElementById('check-button');
    const clearButton = document.getElementById('clear-button');
    const submitPinButton = document.getElementById('submit-pin');
    
    // DOM Elements - Courses
    const courseGrid = document.getElementById('course-grid');
    const logoutButton = document.getElementById('logout-button');
    const addCourseButton = document.getElementById('add-course');
    const deleteCourseButton = document.getElementById('delete-course');
    
    // DOM Elements - Sections
    const backToCoursesButton = document.getElementById('back-to-courses');
    const sectionGrid = document.getElementById('section-grid');
    const courseTitle = document.getElementById('course-title');
    const addSectionButton = document.getElementById('add-section');
    const deleteSectionButton = document.getElementById('delete-section');
    
    // DOM Elements - Class
    const backToSectionsButton = document.getElementById('back-to-sections');
    const sectionTitle = document.getElementById('section-title');
    const classDetails = document.getElementById('class-details');
    const studentList = document.getElementById('student-list');
    const addStudentButton = document.getElementById('add-student');
    const weekButtons = document.querySelectorAll('.week-button');
    const prevWeekButton = document.getElementById('prev-week');
    const nextWeekButton = document.getElementById('next-week');
    
    // DOM Elements - Modals
    const studentModal = document.getElementById('student-modal');
    const studentForm = document.getElementById('student-form');
    const courseSectionModal = document.getElementById('course-section-modal');
    const courseSectionForm = document.getElementById('course-section-form');
    const modalTitle = document.getElementById('modal-title');
    const sectionDetailsContainer = document.getElementById('section-details-container');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    
    // Voice synthesis
    const voiceSynthesis = document.getElementById('voice-synthesis');
    
    // App State
    let currentPin = '';
    let currentCourse = null;
    let currentSection = null;
    let currentWeek = 1;
    let editingStudentId = null;
    let deleteMode = false;
    
    // Sample data - would typically come from a database
    const sampleData = {
        pin: '1234',
        courses: [
            {
                id: 1,
                name: 'BSIT',
                sections: [
                    {
                        id: 101,
                        name: '22011',
                        details: 'WEDNESDAY (3:00 PM - 5:00 PM)',
                        students: [
                            { id: 1001, name: 'Mariel Acabo', attendance: Array(6).fill({}) },
                            { id: 1002, name: 'Aira Villo', attendance: Array(6).fill({}) },
                            { id: 1003, name: 'Cheryl Gales', attendance: Array(6).fill({}) },
                            { id: 1004, name: 'Taylor Swift', attendance: Array(6).fill({}) }
                        ]
                    },
                    {
                        id: 102,
                        name: '22012',
                        details: 'THURSDAY (9:00 AM - 11:00 AM)',
                        students: [
                            { id: 2001, name: 'Noah Swift', attendance: Array(6).fill({}) },
                            { id: 2002, name: 'Emma Bato', attendance: Array(6).fill({}) }
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: 'BSCS',
                sections: [
                    {
                        id: 201,
                        name: '22021',
                        details: 'MONDAY (1:00 PM - 3:00 PM)',
                        students: [
                            { id: 3001, name: 'Olivia Rodrigo', attendance: Array(6).fill({}) },
                            { id: 3002, name: 'Liam James', attendance: Array(6).fill({}) }
                        ]
                    }
                ]
            },
            {
                id: 3,
                name: 'BSED',
                sections: []
            }
        ]
    };
    
    let appData = JSON.parse(localStorage.getItem('attendanceData')) || sampleData;
    
    // Save data to localStorage
    function saveData() {
        localStorage.setItem('attendanceData', JSON.stringify(appData));
    }
    
    // PIN Entry Screen Logic
    pinButtons.forEach(button => {
        button.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            if (currentPin.length < 4) {
                currentPin += value;
                updatePinDisplay();
            }
        });
    });
    
    function updatePinDisplay() {
        pinDisplay.textContent = currentPin.length > 0 ? '*'.repeat(currentPin.length) : 'ENTER PIN';
    }
    
    checkButton.addEventListener('click', function() {
        if (currentPin === appData.pin) {
            showScreen(coursesScreen);
            renderCourses();
            currentPin = '';
            updatePinDisplay();
        } else {
            pinDisplay.textContent = 'INVALID PIN';
            pinDisplay.classList.add('pulse');
            setTimeout(() => {
                pinDisplay.classList.remove('pulse');
                currentPin = '';
                updatePinDisplay();
            }, 1200);
        }
    });
    
    clearButton.addEventListener('click', function() {
        currentPin = '';
        updatePinDisplay();
    });
    
    submitPinButton.addEventListener('click', function() {
        checkButton.click();
    });
    
    // Course Screen Logic
    function renderCourses() {
        courseGrid.innerHTML = '';
        appData.courses.forEach(course => {
            const courseItem = document.createElement('div');
            courseItem.className = 'course-item';
            courseItem.setAttribute('data-id', course.id);
            courseItem.innerHTML = `<div class="course-text">${course.name}</div>`;
            
            courseItem.addEventListener('click', function() {
                if (deleteMode) {
                    deleteCourse(course.id);
                } else {
                    currentCourse = course;
                    courseTitle.textContent = course.name;
                    renderSections();
                    showScreen(sectionsScreen);
                }
            });
            
            courseGrid.appendChild(courseItem);
        });
    }
    
    function deleteCourse(courseId) {
        if (confirm('Are you sure you want to delete this course and all its data?')) {
            appData.courses = appData.courses.filter(course => course.id !== courseId);
            saveData();
            renderCourses();
            deleteMode = false;
            deleteCourseButton.classList.remove('pulse');
        }
    }
    
    logoutButton.addEventListener('click', function() {
        showScreen(attendanceScreen);
    });
    
    addCourseButton.addEventListener('click', function() {
        modalTitle.textContent = 'Add Course';
        document.getElementById('item-name').value = '';
        sectionDetailsContainer.classList.add('hidden');
        showModal(courseSectionModal);
    });
    
    deleteCourseButton.addEventListener('click', function() {
        deleteMode = !deleteMode;
        if (deleteMode) {
            deleteCourseButton.classList.add('pulse');
        } else {
            deleteCourseButton.classList.remove('pulse');
        }
    });
    
    // Section Screen Logic
    function renderSections() {
        sectionGrid.innerHTML = '';
        if (!currentCourse) return;
        
        currentCourse.sections.forEach(section => {
            const sectionItem = document.createElement('div');
            sectionItem.className = 'section-item';
            sectionItem.setAttribute('data-id', section.id);
            sectionItem.innerHTML = `<div class="section-text">${section.name}</div>`;
            
            sectionItem.addEventListener('click', function() {
                if (deleteMode) {
                    deleteSection(section.id);
                } else {
                    currentSection = section;
                    sectionTitle.textContent = `${currentCourse.name} ${section.name}`;
                    classDetails.textContent = `${currentCourse.name} - ${section.name} ${section.details}`;
                    renderAttendance();
                    showScreen(classScreen);
                }
            });
            
            sectionGrid.appendChild(sectionItem);
        });
    }
    
    function deleteSection(sectionId) {
        if (confirm('Are you sure you want to delete this section and all its data?')) {
            currentCourse.sections = currentCourse.sections.filter(section => section.id !== sectionId);
            saveData();
            renderSections();
            deleteMode = false;
            deleteSectionButton.classList.remove('pulse');
        }
    }
    
    backToCoursesButton.addEventListener('click', function() {
        showScreen(coursesScreen);
        currentCourse = null;
    });
    
    addSectionButton.addEventListener('click', function() {
        modalTitle.textContent = 'Add Section';
        document.getElementById('item-name').value = '';
        document.getElementById('section-details').value = '';
        sectionDetailsContainer.classList.remove('hidden');
        showModal(courseSectionModal);
    });
    
    deleteSectionButton.addEventListener('click', function() {
        deleteMode = !deleteMode;
        if (deleteMode) {
            deleteSectionButton.classList.add('pulse');
        } else {
            deleteSectionButton.classList.remove('pulse');
        }
    });
    
    // Class Screen Logic
    function renderAttendance() {
        if (!currentSection) return;
        
        // Update week buttons
        weekButtons.forEach(button => {
            const week = parseInt(button.getAttribute('data-week'));
            button.classList.toggle('active', week === currentWeek);
        });
        
        // Render student list
        studentList.innerHTML = '';
        currentSection.students.forEach(student => {
            const studentAttendance = student.attendance[currentWeek - 1] || {};
            const row = document.createElement('tr');
            row.setAttribute('data-id', student.id);
            
            row.innerHTML = `
                <td>${student.name}</td>
                <td><input type="radio" name="attendance-${student.id}" value="present" ${studentAttendance.status === 'present' ? 'checked' : ''} class="attendance-radio"></td>
                <td><input type="radio" name="attendance-${student.id}" value="absent" ${studentAttendance.status === 'absent' ? 'checked' : ''} class="attendance-radio"></td>
                <td><input type="radio" name="attendance-${student.id}" value="late" ${studentAttendance.status === 'late' ? 'checked' : ''} class="attendance-radio"></td>
                <td><button class="voice-button" data-name="${student.name}">🔊</button></td>
                <td><button class="edit-button" data-id="${student.id}">✏️</button></td>
            `;
            
            studentList.appendChild(row);
        });
        
        // Attach event listeners to attendance radio buttons
        document.querySelectorAll('.attendance-radio').forEach(radio => {
            radio.addEventListener('change', function() {
                const studentId = parseInt(this.name.split('-')[1]);
                const status = this.value;
                updateStudentAttendance(studentId, status);
            });
        });
        
        // Attach event listeners to voice buttons
        document.querySelectorAll('.voice-button').forEach(button => {
            button.addEventListener('click', function() {
                const studentName = this.getAttribute('data-name');
                speakStudentName(studentName);
            });
        });
        
        // Attach event listeners to edit buttons
        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', function() {
                const studentId = parseInt(this.getAttribute('data-id'));
                editStudent(studentId);
            });
        });
    }
    
    function updateStudentAttendance(studentId, status) {
        const studentIndex = currentSection.students.findIndex(student => student.id === studentId);
        if (studentIndex >= 0) {
            if (!currentSection.students[studentIndex].attendance[currentWeek - 1]) {
                currentSection.students[studentIndex].attendance[currentWeek - 1] = {};
            }
            currentSection.students[studentIndex].attendance[currentWeek - 1].status = status;
            saveData();
        }
    }
    
    function speakStudentName(name) {
        // Using the Web Speech API
        const utterance = new SpeechSynthesisUtterance(name);
        speechSynthesis.speak(utterance);
        
        // Visual feedback
        const voiceButton = document.querySelector(`.voice-button[data-name="${name}"]`);
        if (voiceButton) {
            voiceButton.classList.add('pulse');
            setTimeout(() => {
                voiceButton.classList.remove('pulse');
            }, 1500);
        }
    }
    
    function editStudent(studentId) {
        const student = currentSection.students.find(student => student.id === studentId);
        if (student) {
            document.getElementById('student-name').value = student.name;
            document.getElementById('student-id').value = studentId;
            editingStudentId = studentId;
            showModal(studentModal);
        }
    }
    
    backToSectionsButton.addEventListener('click', function() {
        showScreen(sectionsScreen);
        currentSection = null;
    });
    
    weekButtons.forEach(button => {
        button.addEventListener('click', function() {
            currentWeek = parseInt(this.getAttribute('data-week'));
            renderAttendance();
        });
    });
    
    prevWeekButton.addEventListener('click', function() {
        if (currentWeek > 1) {
            currentWeek--;
            renderAttendance();
        }
    });
    
    nextWeekButton.addEventListener('click', function() {
        if (currentWeek < 6) {
            currentWeek++;
            renderAttendance();
        }
    });
    
    addStudentButton.addEventListener('click', function() {
        document.getElementById('student-name').value = '';
        document.getElementById('student-id').value = '';
        editingStudentId = null;
        showModal(studentModal);
    });
    
    // Modal Logic
    function showModal(modal) {
        modal.classList.remove('hidden');
    }
    
    function hideModal(modal) {
        modal.classList.add('hidden');
    }
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal);
        });
    });
    
    // When clicking outside the modal content, close it
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                hideModal(this);
            }
        });
    });
    
    // Form submissions
    studentForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('student-name').value.trim();
        const studentId = document.getElementById('student-id').value.trim();
        
        if (name && studentId) {
            if (editingStudentId) {
                // Edit existing student
                const studentIndex = currentSection.students.findIndex(student => student.id === editingStudentId);
                if (studentIndex >= 0) {
                    currentSection.students[studentIndex].name = name;
                    currentSection.students[studentIndex].id = parseInt(studentId);
                }
            } else {
                // Add new student
                const newStudent = {
                    id: parseInt(studentId),
                    name: name,
                    attendance: Array(6).fill({})
                };
                currentSection.students.push(newStudent);
            }
            
            saveData();
            renderAttendance();
            hideModal(studentModal);
        }
    });
    
    courseSectionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const name = document.getElementById('item-name').value.trim();
        
        if (name) {
            if (modalTitle.textContent === 'Add Course') {
                // Add new course
                const newId = Math.max(...appData.courses.map(course => course.id), 0) + 1;
                const newCourse = {
                    id: newId,
                    name: name,
                    sections: []
                };
                appData.courses.push(newCourse);
                renderCourses();
            } else {
                // Add new section
                const details = document.getElementById('section-details').value.trim();
                const newId = Math.max(...currentCourse.sections.map(section => section.id), 0) + 1;
                const newSection = {
                    id: newId,
                    name: name,
                    details: details,
                    students: []
                };
                currentCourse.sections.push(newSection);
                renderSections();
            }
            
            saveData();
            hideModal(courseSectionModal);
        }
    });
    
    // Helper functions
    function showScreen(screen) {
        // Hide all screens
        attendanceScreen.classList.add('hidden');
        coursesScreen.classList.add('hidden');
        sectionsScreen.classList.add('hidden');
        classScreen.classList.add('hidden');
        
        // Show the requested screen
        screen.classList.remove('hidden');
    }
    
    // Animation for transitioning between screens
    function animateTransition(fromScreen, toScreen) {
        fromScreen.classList.add('fade-out');
        setTimeout(() => {
            fromScreen.classList.add('hidden');
            fromScreen.classList.remove('fade-out');
            toScreen.classList.remove('hidden');
            toScreen.classList.add('fade-in');
            setTimeout(() => {
                toScreen.classList.remove('fade-in');
            }, 500);
        }, 500);
    }
    
    // Initial setup
    updatePinDisplay();
});