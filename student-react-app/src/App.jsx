import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api/students';

const emptyForm = {
  firstname: '',
  middlename: '',
  lastname: '',
  contact_number: '',
  course: '',
  year: ''
};

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadStudents = async () => {
    try {
      const response = await axios.get(API_URL);
      const data = response.data;
      setStudents(Array.isArray(data) ? data : (data.data || []));
      setError('');
    } catch {
      setError('Could not load students. Check that Laravel is running and CORS is configured.');
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form);
        setMessage('Student updated successfully.');
      } else {
        await axios.post(API_URL, form);
        setMessage('Student added successfully.');
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Check the API and form data.');
    }
  };

  const editStudent = (student) => {
    setForm({
      firstname: student.firstname || '',
      middlename: student.middlename || '',
      lastname: student.lastname || '',
      contact_number: student.contact_number || '',
      course: student.course || '',
      year: String(student.year || '')
    });
    setEditingId(student.id);
    setMessage('');
    setError('');
  };

  const deleteStudent = async (id) => {
    if (!window.confirm('Delete this student record?')) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setMessage('Student deleted successfully.');
      if (editingId === id) {
        setEditingId(null);
        setForm(emptyForm);
      }
      await loadStudents();
    } catch {
      setError('Could not delete the student.');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <main className="container">
      <header className="page-header">
        <p className="eyebrow">LARAVEL API RESOURCE + REACT</p>
        <h1>Student Records</h1>
        <p className="subtitle">Manage student information through the Laravel REST API.</p>
      </header>

      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}

      <section className="panel">
        <h2>{editingId ? 'Update Student' : 'Add a Student'}</h2>
        <form onSubmit={handleSubmit} className="student-form">
          <label>First name
            <input name="firstname" value={form.firstname} onChange={handleChange} required />
          </label>
          <label>Middle name
            <input name="middlename" value={form.middlename} onChange={handleChange} />
          </label>
          <label>Last name
            <input name="lastname" value={form.lastname} onChange={handleChange} required />
          </label>
          <label>Contact number
            <input name="contact_number" value={form.contact_number} onChange={handleChange} required />
          </label>
          <label>Course
            <input name="course" value={form.course} onChange={handleChange} placeholder="e.g. BSIT" required />
          </label>
          <label>Year level
            <input name="year" value={form.year} onChange={handleChange} placeholder="e.g. 3" required />
          </label>
          <div className="form-actions">
            <button type="submit">{editingId ? 'Save Changes' : 'Add Student'}</button>
            {editingId && <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="table-heading">
          <h2>Student List</h2>
          <button className="secondary" onClick={loadStudents}>Refresh List</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th><th>Full Name</th><th>Contact</th>
                <th>Course</th><th>Year</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{[student.firstname, student.middlename, student.lastname].filter(Boolean).join(' ')}</td>
                  <td>{student.contact_number}</td>
                  <td>{student.course}</td>
                  <td>{student.year}</td>
                  <td className="actions">
                    <button className="small" onClick={() => editStudent(student)}>Edit</button>
                    <button className="small danger" onClick={() => deleteStudent(student.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan="6" className="empty">No student records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <footer>Student Records • React frontend connected to Laravel API</footer>
    </main>
  );
}