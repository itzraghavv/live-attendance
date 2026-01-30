export type AttendanceStatus = "present" | "absent";

export type AttendanceSession = {
  classId: string;
  startedAt: string;
  attendance: Record<string, AttendanceStatus>;
};

let activeSession: AttendanceSession | null = null;

export const getActiveSession = () => activeSession;

export const startSession = (classId: string) => {
  activeSession = {
    classId,
    startedAt: new Date().toISOString(),
    attendance: {},
  };
};

export const clearSession = () => {
  activeSession = null;
};
