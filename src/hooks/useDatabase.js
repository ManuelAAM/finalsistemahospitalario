import { useState, useEffect } from 'react';
import { 
    getPatients, getVitalSigns, getTreatments, getNurseNotes, getAppointments,
    addVitalSignsDB, addTreatmentDB, addNurseNoteDB, updatePatientDB, 
    updateNurseNote, deleteNurseNote, initDatabase 
} from '../services/database';

// Inicializador global
export const initializeApp = async () => {
    return await initDatabase();
};

/**
 * Hook para obtener pacientes con filtrado por enfermero
 * @param {Object} options - Opciones de filtrado
 * @param {number} options.nurseId - ID del enfermero
 * @param {string} options.role - Rol del usuario
 * @param {string} options.shift - Turno actual
 */
export function usePatients(options = {}) {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            const data = await getPatients(options);
            setPatients(data);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useEffect(() => { refresh(); }, [options.nurseId, options.role, options.shift]);

    const updatePatient = async (id, data) => {
        await updatePatientDB(id, data);
        await refresh();
    };

    return { patients, updatePatient, loading, refresh };
}

export function useVitalSigns() {
    const [vitalSigns, setVitalSigns] = useState([]);
    
    const refresh = async () => {
        const data = await getVitalSigns();
        setVitalSigns(data);
    };
    
    useEffect(() => { refresh(); }, []);

    const addVitalSigns = async (data) => {
        await addVitalSignsDB(data);
        await refresh();
    };

    return { vitalSigns, addVitalSigns };
}

export function useTreatments() {
    const [treatments, setTreatments] = useState([]);
    
    const refresh = async () => {
        const data = await getTreatments();
        setTreatments(data);
    };
    
    useEffect(() => { refresh(); }, []);

    const addTreatment = async (data) => {
        await addTreatmentDB(data);
        await refresh();
    };

    return { treatments, addTreatment };
}

export function useNurseNotes() {
    const [nurseNotes, setNurseNotes] = useState([]);
    
    const refresh = async () => {
        const data = await getNurseNotes();
        setNurseNotes(data);
    };
    
    useEffect(() => { refresh(); }, []);

    const addNurseNote = async (data) => {
        await addNurseNoteDB(data);
        await refresh();
    };

    const editNurseNote = async (noteId, data) => {
        await updateNurseNote(noteId, data);
        await refresh();
    };

    const deleteNurseNoteById = async (noteId) => {
        await deleteNurseNote(noteId);
        await refresh();
    };

    return { nurseNotes, addNurseNote, editNurseNote, deleteNurseNote: deleteNurseNoteById, refresh };
}

export function useAppointments() {
    const [appointments, setAppointments] = useState([]);
    useEffect(() => {
        getAppointments().then(setAppointments);
    }, []);
    return { appointments };
}
