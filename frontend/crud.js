// crud.js

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
      <td>$${Number(p.project_cost).toLocaleString()}</td>
      <td>${p.duration_start}</td>
      <td>${p.duration_end}</td>
      <td>${p.progress}</td>
      <td>
        <button class="edit-btn" onclick="editProject(${p.project_id})">Edit</button>
        <button class="delete-btn" onclick="deleteProject(${p.project_id})">Delete</button>
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

// Edit project (placeholder)
async function editProject(id) {
  alert('Edit functionality for project ID: ' + id);
}

// Delete project
async function deleteProject(id) {
  if(confirm('Are you sure you want to delete this project?')) {
    await fetch(`/projects/${id}`, { method: 'DELETE' });
    loadProjects();
  }
}

// Initialize CRUD when projects page is shown
document.addEventListener('DOMContentLoaded', () => {
  const projectsLink = document.querySelector('a[onclick="showPage(\'projects\')"]');
  projectsLink.addEventListener('click', () => {
    loadProjects();
    initProjectForm();
  });
});