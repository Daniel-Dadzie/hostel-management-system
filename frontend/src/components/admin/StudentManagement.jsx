import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        // Ensure your API_URL matches your Render backend URL
        const response = await axios.get('https://hostel-management-system-3ce9.onrender.com/api/admin/students');
        setStudents(response.data);
    };

    const deleteStudent = async (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            await axios.delete(`https://hostel-management-system-3ce9.onrender.com/api/admin/students/${id}`);
            fetchStudents(); // Refresh the list
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Student Management</h2>
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 border">Name</th>
                        <th className="py-2 border">Email</th>
                        <th className="py-2 border">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.id}>
                            <td className="py-2 border text-center">{student.fullName}</td>
                            <td className="py-2 border text-center">{student.email}</td>
                            <td className="py-2 border text-center">
                                <button 
                                    onClick={() => deleteStudent(student.id)} 
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StudentManagement;