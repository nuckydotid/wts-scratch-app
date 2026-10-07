/** Placeholder English texts for expo-story previews (dev-only, not i18n). */
export const STORY_FLAT = {
  menuA11yLabel: "Menu",
  backA11yLabel: "Back",
  moreActionsA11yLabel: "More actions",
  retryLabel: "Try again",
  retryTitle: "Couldn't load",
  cancel: "Cancel",
};

export const STORY_BLOCKS = {
  navBarA11yMenu: "Menu",
  navBarA11yBack: "Back",
  navBarA11yMore: "More actions",
  retry: "Try again",
  errorRetry: "Retry",
  errorLogout: "Log out",
  cancel: "Cancel",
};

export const STORY_TEACHER_LIST_TEXTS = {
  searchSheet: {
    menuLabel: "Search",
    title: "Search",
    subtitle: "Type a keyword, then apply.",
    placeholder: "Search…",
    submitLabel: "Apply",
  },
  validation: {
    nameRequired: "Name is required.",
    nameNoDigits: "Name cannot contain numbers",
    emailInvalid: "Enter a valid email.",
    schoolEmailDomain: "School email must use the school domain",
  },
  inviteFields: {
    nameLabel: "Name",
    namePlaceholder: "Teacher name",
    authEmailLabel: "Auth Email",
    authEmailPlaceholder: "teacher@example.com",
    schoolEmailLabel: "School Email",
    schoolEmailPlaceholder: "siti@example.com",
    phoneLabel: "Phone",
    phonePlaceholder: "08xxxxxxxxxx",
  },
  inviteSheet: {
    title: "Invite Teacher",
    subtitle: "The teacher signs in with their auth email.",
    submitLabel: "Invite",
  },
  menu: { label: "Add Teacher", subtitle: "Invite a teacher" },
  searchPlaceholder: "Search teachers by name",
  emptyLabel: "No results",
  bannedPill: "Suspended",
  emptyState: { title: "No teachers yet", subtitle: "Invite teachers to get started" },
  errorState: { title: "Something went wrong", subtitle: "Failed to load teachers" },
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_DETAIL_TEXTS = {
  validation: STORY_TEACHER_LIST_TEXTS.validation,
  editFields: {
    nameLabel: "Name",
    namePlaceholder: "Teacher name",
    schoolEmailLabel: "School Email",
    schoolEmailPlaceholder: "siti@example.com",
    phoneLabel: "Phone",
    phonePlaceholder: "08xxxxxxxxxx",
  },
  editSheet: {
    title: "Edit Teacher",
    subtitle: "The auth email cannot be changed here.",
    submitLabel: "Save",
  },
  suspend: {
    title: "Suspend Teacher",
    description: "The teacher will not be able to sign in until reactivated.",
    confirmLabel: "Suspend",
    menuLabel: "Suspend",
    menuSubtitle: "Block teacher sign-in",
    reactivateTitle: "Reactivate Teacher",
    reactivateDescription: "The teacher can sign in and access their classes again.",
    reactivateConfirmLabel: "Reactivate",
    reactivateMenuLabel: "Reactivate",
    reactivateMenuSubtitle: "Re-enable sign-in",
  },
  deleteSheet: {
    title: "Delete Teacher",
    description: "This will permanently remove the teacher account.",
    confirmLabel: "Delete",
  },
  menu: {
    editLabel: "Edit",
    editSubtitle: "Edit teacher details",
    deleteLabel: "Delete",
    deleteSubtitle: "Remove this teacher",
  },
  navbarTitle: "Teacher Detail",
  suspendedBanner: "Account suspended",
  sections: {
    information: "Information",
    authEmail: "Auth Email",
    schoolEmail: "School Email",
    phone: "Phone",
    assignedSemesters: "Assigned Semesters",
    noSemesters: "No semesters assigned",
  },
  blocks: STORY_BLOCKS,
};

export const STORY_STUDENT_LIST_TEXTS = {
  searchSheet: {
    menuLabel: "Search",
    title: "Search",
    subtitle: "Type a keyword, then apply.",
    placeholder: "Search…",
    submitLabel: "Apply",
  },
  validation: {
    nisRequired: "NIS is required.",
    nameRequired: "Name is required.",
    nameNoDigits: "Name cannot contain numbers",
    birthPlaceRequired: "Birth place is required.",
    birthDateRequired: "Birth date is required.",
    birthDateInvalid: "Birth date is invalid.",
    parentNameRequired: "Parent name is required.",
  },
  fields: {
    nisLabel: "NIS",
    nisPlaceholder: "e.g. 20250001",
    nisnLabel: "NISN",
    nisnPlaceholder: "e.g. 0123456789",
    legalNameLabel: "Legal Name",
    legalNamePlaceholder: "Student full name",
    birthPlaceLabel: "Birth Place",
    birthPlacePlaceholder: "City of birth",
    birthDateLabel: "Birth Date",
    birthDatePlaceholder: "Select birth date",
    parentNameLabel: "Parent Name",
    parentNamePlaceholder: "Parent name",
  },
  createSheet: {
    title: "Add Student",
    subtitle: "Enter the basic student data.",
    submitLabel: "Save Submission",
  },
  menu: { label: "Add Student", subtitle: "Register a new student" },
  searchPlaceholder: "Search students by name",
  emptyLabel: "No results",
  emptyState: { title: "No students yet.", subtitle: "Add a student to get started" },
  errorState: { title: "Something went wrong", subtitle: "Could not load students." },
  rowNisPrefix: "NIS: ",
  blocks: STORY_BLOCKS,
  photoField: {
    mediaPicker: {
      title: "Allowed files: .JPG, .PNG, .WEBP",
      changeLabel: "Change Photo",
      deleteLabel: "Delete",
      uploadingLabel: "Uploading...",
      changeConfirmTitle: "Replace Media?",
      changeConfirmDesc: "The current media will be replaced with a new one.",
      changeConfirmAction: "Yes, Replace",
      deleteConfirmTitle: "Delete Media?",
      deleteConfirmDesc: "This media will be removed.",
      deleteConfirmAction: "Delete",
      cancelLabel: "Cancel",
    },
    crop: {
      title: "Crop Image",
      confirmLabel: "Done",
      cancelLabel: "Cancel",
      ratioFreeLabel: "Free",
    },
    permissionError: "Media library permission not granted",
  },
};

export const STORY_STUDENT_DETAIL_TEXTS = {
  validation: STORY_STUDENT_LIST_TEXTS.validation,
  fields: STORY_STUDENT_LIST_TEXTS.fields,
  editSheet: { title: "Edit Student", subtitle: "Update the student data.", submitLabel: "Save" },
  deleteSheet: {
    title: "Delete Student",
    description: "This will permanently remove the student.",
    confirmLabel: "Delete",
  },
  unlinkSheet: {
    title: "Unlink Parent",
    description: "The parent will lose access to this student's data.",
    confirmLabel: "Unlink",
  },
  menu: {
    editLabel: "Edit",
    editSubtitle: "Edit student details",
    idCardLabel: "Student ID Card",
    idCardSubtitle: "View the student ID card",
    linkParentLabel: "Link Parent",
    linkParentSubtitle: "Link a parent account",
    deleteLabel: "Delete",
    deleteSubtitle: "Remove this student",
  },
  navbarTitle: "Student Detail",
  sections: {
    information: "Information",
    nis: "NIS",
    nisn: "NISN",
    birthPlace: "Birth Place",
    birthDate: "Birth Date",
    parentName: "Parent Name",
    parents: "Parents",
    noParents: "No parents yet.",
    class: "Class",
  },
  blocks: STORY_BLOCKS,
  photoField: STORY_STUDENT_LIST_TEXTS.photoField,
};

export const STORY_CLASSES_TEXTS = {
  menuAddLabel: "Add Class",
  menuAddSubtitle: "Create a new class",
  semesterCountSuffix: "Semesters",
  emptyTitle: "No classes yet. Create your first class above.",
  errorTitle: "Something went wrong",
  errorSubtitle: "Could not load classes.",
  blocks: STORY_BLOCKS,
};

export const STORY_CLASS_DETAIL_TEXTS = {
  navbarTitle: "Class Detail",
  validationNameRequired: "Class name is required.",
  renameSheet: {
    title: "Rename Class",
    subtitle: "Change the class name shown to teachers and parents.",
    label: "Class Name",
    placeholder: "Class name (e.g. Class A)",
    submitLabel: "Save Changes",
  },
  semesterSheet: {
    title: "Add Semester",
    subtitle: "A semester groups one period of teaching into a class.",
    label: "Name (e.g. 2025 Odd)",
    placeholder: "Enter semester name",
    submitLabel: "Create",
  },
  deleteSheet: {
    title: "Delete Class",
    description:
      "Delete this class? Teachers and students will be unassigned, but students won't be deleted.",
    confirmLabel: "Delete",
  },
  menu: {
    renameLabel: "Rename",
    renameSubtitle: "Change the class name",
    addSemesterLabel: "Add Semester",
    addSemesterSubtitle: "Create a new semester",
    deleteLabel: "Delete",
    deleteSubtitle: "Remove this class",
  },
  navbarFallbackTitle: "Class Detail",
  studentCountSuffix: "students",
  teacherCountSuffix: "teachers",
  activeBadge: "ACTIVE",
  semesterListTitle: "Semester List",
  classNameLabel: "Class Name",
  totalSemestersLabel: "Total Semesters",
  activeSemesterLabel: "Active Semester",
  emptyTitle: "No semesters yet.",
  errorTitle: "Something went wrong",
  errorSubtitle: "Could not load semesters.",
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_CLASS_MENU_TEXTS = {
  items: {
    students: { label: "Students", subtitle: "View class students" },
    attendance: { label: "Attendance", subtitle: "Mark daily attendance" },
    subjects: { label: "Subjects", subtitle: "Manage class subjects" },
    tasks: { label: "Tasks", subtitle: "Manage tasks and assignments" },
    report: { label: "Report", subtitle: "View grade reports" },
    measurements: { label: "Measurements", subtitle: "Record growth measurements" },
  },
  retryLabel: "Retry",
  retryTitle: "Couldn't load this class",
  errorTitle: "Something went wrong",
  errorSubtitle: "Could not load the class.",
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_SUBJECTS_TEXTS = {
  noSubjects: "No subjects in this semester yet.",
  addSubjectNewMenu: "Add New Subject",
  addSubjectExistingMenu: "Add Existing Subject",
  newSubjectSheet: {
    title: "Add New Subject",
    subtitle: "New subject for this semester",
    titleLabel: "Subject Title",
    titlePlaceholder: "e.g. Matematika Dasar",
    subtitleLabel: "Description",
    subtitlePlaceholder: "e.g. Belajar berhitung dan angka",
    submitLabel: "Save Subject",
    cancelLabel: "Cancel",
    validationTitleRequired: "Subject title is required",
    validationSubtitleRequired: "Description is required",
  },
  catalogSheet: {
    title: "Subject Catalog",
    subtitle: "Select subjects from master catalog",
    searchPlaceholder: "Search subject name or code...",
    noSearchResults: "No subjects match your search.",
    noSubjects: "No subjects available in catalog.",
    submitLabel: "Save Selection",
  },
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_TASKS_TEXTS = {
  noTasks: "No tasks created in this semester yet.",
  addTaskMenu: "Add New Task",
  newTaskSheet: {
    title: "Add New Task",
    subtitle: "Create task for this semester",
    subjectLabel: "Subject",
    subjectPlaceholder: "Choose subject",
    titleLabel: "Task Title",
    titlePlaceholder: "e.g. Berhitung 1 sampai 10",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Optional",
    imageLabel: "Photo / Image",
    imageHint: "Allowed files: .JPG, .PNG, .WEBP",
    changePhotoLabel: "Change Photo",
    removePhotoLabel: "Delete",
    uploadingLabel: "Uploading…",
    changeConfirmTitle: "Change Photo?",
    changeConfirmDesc: "Are you sure you want to replace this photo?",
    changeConfirmAction: "Replace",
    deleteConfirmTitle: "Delete Photo?",
    deleteConfirmDesc: "Are you sure you want to delete this photo?",
    deleteConfirmAction: "Delete",
    submitLabel: "Save Task",
    cancelLabel: "Cancel",
    validationSubjectRequired: "Subject is required",
    validationTitleRequired: "Task title is required",
  },
  subjectPickerSheet: {
    title: "Choose Subject",
    subtitle: "Select a subject for this task",
    noSubjects: "No subjects available",
  },
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_CLASS_STUDENTS_TEXTS = {
  searchSheet: {
    menuLabel: "Search",
    title: "Search",
    subtitle: "Type a keyword, then apply.",
    placeholder: "Search…",
    submitLabel: "Apply",
  },
  navbarTitle: "Class Students",
  searchPlaceholder: "Search students by name",
  emptyLabel: "No results",
  emptyState: { title: "No students yet", subtitle: "Students appear after enrollment" },
  errorState: { title: "Something went wrong", subtitle: "Could not load students." },
  blocks: STORY_BLOCKS,
};

export const STORY_SCAN_STATUS_TEXTS = {
  confirmLabels: {
    unclaimed: "Link",
    claimed: "Join family",
    denied: "Request again",
    pending: "Pending",
    linked: "Linked",
    family: "Family",
  },
  cancelLabel: "Cancel",
  statusLabels: {
    linked: "Linked",
    family: "Family member",
    pending: "Request sent",
    denied: "Request denied",
    unclaimed: "Not linked yet",
    claimed: "Linked to another parent",
  },
  statusHints: {
    pending: "We sent the request to the child's parent for approval.",
    denied: "The request was denied. You can scan again to re-request.",
  },
  closeLabel: "Close",
};

export const STORY_PARENT_SCAN_TEXTS = {
  hint: "Point the camera at your child's QR card",
  resultLabel: "Scanned child",
  viewDetailLabel: "View child details",
  errorLabel: "QR code not recognized",
  retryLabel: "Scan again",
  retryTitle: "Couldn't scan the QR card",
  ...STORY_SCAN_STATUS_TEXTS,
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_STUDENT_DETAIL_TEXTS = {
  title: "Student Detail",
  nisPrefix: "NIS ",
  roleLabel: "Student",
  sections: { information: "Information", shortcuts: "Menu" },
  infoRows: {
    nis: "NIS",
    nisn: "NISN",
    birthPlace: "Birth Place",
    birthDate: "Birth Date",
    parent: "Parent",
  },
  cards: {
    report: "Report",
    tasks: "Task List",
    growth: "Growth",
    attendance: "Attendance",
    idCard: "ID Card",
  },
  retryLabel: "Retry",
  retryTitle: "Couldn't load this student",
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_STUDENT_REPORT_TEXTS = {
  title: "Laporan Nilai",
  noSemesters: "No semesters yet.",
  noSubjects: "No subjects recorded.",
  scoreLabel: "Score:",
  retryLabel: "Retry",
  retryTitle: "Couldn't load report",
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_STUDENT_GRADES_TEXTS = STORY_TEACHER_STUDENT_REPORT_TEXTS;

export const STORY_TEACHER_STUDENT_TASKS_TEXTS = {
  title: "Daftar Tugas",
  noTasks: "No tasks recorded.",
  noTasksInSemester: "No tasks in this semester.",
  scoreLabel: "Score:",
  retryLabel: "Retry",
  retryTitle: "Couldn't load tasks",
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_STUDENT_GROWTH_TEXTS = {
  title: "Growth",
  addMeasurementLabel: "Add Measurement",
  showChartLabel: "Show Chart",
  noMeasurements: "No measurements yet.",
  weightUnit: "kg",
  heightUnit: "cm",
  headUnit: "cm",
  weightLabelShort: "W",
  heightLabelShort: "H",
  headLabelShort: "HC",
  form: {
    title: "Add Measurement",
    studentLabel: "Growth",
    submitLabel: "Save",
    fields: {
      weightLabel: "Weight (kg)",
      weightPlaceholder: "e.g. 12.5",
      heightLabel: "Height (cm)",
      heightPlaceholder: "e.g. 95",
      headLabel: "Head circumference (cm)",
      headPlaceholder: "e.g. 48",
    },
    validation: {
      weightRequired: "Weight is required",
      weightInvalid: "Weight must be a number",
      heightRequired: "Height is required",
      heightInvalid: "Height must be a number",
      headInvalid: "Head circumference must be a number",
    },
  },
  retryLabel: "Retry",
  retryTitle: "Couldn't load growth data",
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_GROWTH_CHARTS_TEXTS = {
  filterLabel: "Filter by Year",
  filterTitle: "Filter by Year",
  filterSubmitLabel: "Apply",
  noMeasurements: "No measurements in this year.",
  chartTitles: {
    weight: "Weight (kg)",
    height: "Height (cm)",
    head: "Head circumference (cm)",
  },
  yUnits: {
    weight: "kg",
    height: "cm",
    head: "cm",
  },
  blocks: STORY_BLOCKS,
};

export const STORY_TEACHER_STUDENT_ATTENDANCE_TEXTS = {
  attendanceTitle: "Attendance",
  statLabels: { present: "Present", sick: "Sick", absent: "Absent" },
  noData: "No attendance recorded.",
  retryLabel: "Retry",
  retryTitle: "Couldn't load attendance",
  blocks: STORY_BLOCKS,
};

export const STORY_PARENTS_TEXTS = {
  searchSheet: {
    menuLabel: "Search",
    title: "Search",
    subtitle: "Type a keyword, then apply.",
    placeholder: "Search…",
    submitLabel: "Apply",
  },
  searchPlaceholder: "Search parents by name",
  emptyLabel: "No results",
  emptyState: { title: "No parents yet", subtitle: "Parents appear after linking a child" },
  errorState: { title: "Something went wrong", subtitle: "Could not load parents." },
  bannedPill: "Suspended",
  blocks: STORY_BLOCKS,
};

export const STORY_PARENT_DETAIL_TEXTS = {
  ban: {
    suspendTitle: "Suspend account?",
    suspendDescription: "The parent cannot sign in until the account is reactivated.",
    suspendConfirm: "Suspend account",
    reactivateTitle: "Reactivate account?",
    reactivateDescription: "The parent can sign in again with their email.",
    reactivateConfirm: "Reactivate account",
    confirmLabel: "Yes",
    menuLabel: "Suspend account",
    menuSuspendSubtitle: "Block access for this parent",
    menuReactivateSubtitle: "Restore access for this parent",
  },
  navbarTitle: "Parent Detail",
  suspendedRole: "Suspended",
  emailLabel: "Email",
  phoneLabel: "Phone",
  linkedStudentsTitle: "Linked students",
  noStudents: "No linked students yet.",
  nisPrefix: "NIS ",
  selfClaimedSuffix: "Self-claimed",
  blocks: STORY_BLOCKS,
};

export const STORY_SEMESTER_DETAIL_TEXTS = {
  navbarTitle: "Semester Detail",
  classLabel: "Class",
  semesterLabel: "Semester",
  renameSubtitle: "The semester name is shown to teachers and parents.",
  rename: "Rename",
  addTeacher: "Add Teacher",
  addStudent: "Add Student",
  delete: "Delete",
  cancel: "Cancel",
  deleteTitle: "Delete Semester",
  deleteDescription:
    "Delete this semester? All teacher and student assignments for this semester will be removed.",
  deleteConfirm: "Delete",
  statusSection: "Status",
  statusActive: "Active",
  statusInactive: "Inactive",
  statusActiveDesc: "This semester is active. Students and teachers can see it.",
  statusInactiveDesc: "Activate this semester to make it visible to students and teachers.",
  activateTitle: "Activate Semester",
  activateConfirm: "Activate this semester? It will become visible to students and teachers.",
  deactivateTitle: "Deactivate Semester",
  deactivateConfirm:
    "Deactivate this semester? It will no longer be visible to students and teachers.",
  activateLabel: "Activate",
  deactivateLabel: "Deactivate",
  validationTitle: "Cannot Activate Semester",
  validationReasons: [
    "Another semester in this class is already active.",
    "Assign at least one teacher to this semester.",
    "Enroll at least one student in this semester.",
  ] as [string, string, string],
  validationBack: "Back",
  otherActiveTitle: "Another Semester Is Active",
  otherActiveDesc:
    "Activating this semester will deactivate the other active semester in this class. Continue?",
  otherActiveConfirm: "Activate",
  teachersSection: "Teachers",
  studentsSection: "Students",
  teachersEmpty: "No teachers yet.",
  studentsEmpty: "No students yet.",
  addTeachersTitle: "Add Teachers",
  addStudentsTitle: "Add Students",
  searchTeachersPlaceholder: "Search teachers by name",
  searchStudentsPlaceholder: "Search students by name",
  saveCount: "Save ({count})",
  noResults: "No results",
  menuSubtitles: {
    rename: "Change the semester name",
    addTeacher: "Assign a teacher",
    addStudent: "Enroll a student",
    delete: "Remove this semester",
  },
  blocks: STORY_BLOCKS,
};

export const STORY_ID_CARD_TEXTS = {
  headerLines: ["RAUDHATUL ATHFAL", "MIFTAHUL FALAH"],
  shareLabel: "Share ID Card",
  sharingLabel: "Preparing...",
  shareErrorLabel: "Could not share the ID card.",
  downloadLabel: "Download ID Card",
  rowLabels: {
    name: "Name",
    nis: "NIS",
    nisn: "NISN",
    birthPlace: "Birth Place",
    birthDate: "Date of Birth",
  },
  navbarTitle: "Student ID Card",
  blocks: STORY_BLOCKS,
};

export const STORY_DASHBOARD_LABELS = {
  classes: "Classes",
  students: "Students",
  teachers: "Teachers",
  parents: "Parents",
};
