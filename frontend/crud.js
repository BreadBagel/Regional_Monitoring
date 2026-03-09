// crud.js

// Show/hide pages
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

// Load projects
async function loadProjects() {
  const res = await fetch('/projects');
  const projects = await res.json();
  const tbody = document.querySelector('#projectsTable tbody');
  tbody.innerHTML = '';
  projects.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${p.project_id}</td>
      <td>${p.municipality_name}</td>
      <td>${p.project_name}</td>
      <td>${p.project_cost}</td>
      <td>${p.duration_start}</td>
      <td>${p.duration_end}</td>
      <td>${p.progress}</td>
      <td>
        <button onclick="deleteProject(${p.project_id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Add project
function initProjectForm() {
  const form = document.getElementById('projectForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    await fetch('/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    form.reset();
    loadProjects();
  });
}

// Delete project
async function deleteProject(id) {
  await fetch(`/projects/${id}`, { method: 'DELETE' });
  loadProjects();
}

// Initialize CRUD when projects page is shown
document.addEventListener('DOMContentLoaded', () => {
  const projectsLink = document.querySelector('a[onclick="showPage(\'projects\')"]');
  projectsLink.addEventListener('click', () => {
    loadProjects();
    initProjectForm();
  });
});
