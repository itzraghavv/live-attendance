type AttendanceStatus = "present" | "absent";

type ActiveSession = {
  classId: string;
  startedAt: string; // ISO string
  attendance: Record<string, AttendanceStatus>; // studentId: status
};

let activeSession: ActiveSession | null = null;

export const attendanceState = {
  /**
   * Start a new attendance session
   * @param classId - The class ID to start session for
   * @returns The active session or null if one already exists
   */
  startSession(classId: string): ActiveSession | null {
    if (activeSession) {
      return null; // Session already active
    }

    activeSession = {
      classId,
      startedAt: new Date().toISOString(),
      attendance: {},
    };

    return activeSession;
  },

  /**
   * Get the current active session
   */
  getSession(): ActiveSession | null {
    return activeSession;
  },

  /**
   * Mark attendance for a student
   * @param studentId - The student ID
   * @param status - "present" or "absent"
   * @returns true if successful, false if no active session
   */
  markAttendance(studentId: string, status: AttendanceStatus): boolean {
    if (!activeSession) {
      return false;
    }

    activeSession.attendance[studentId] = status;
    return true;
  },

  /**
   * End the current session
   * @returns The ended session data or null if no session was active
   */
  endSession(): ActiveSession | null {
    if (!activeSession) {
      return null;
    }

    const endedSession = { ...activeSession };
    activeSession = null;
    return endedSession;
  },

  /**
   * Check if a session is active
   */
  isActive(): boolean {
    return activeSession !== null;
  },
};

