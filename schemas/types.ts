export interface Task {
    id: string;
    title: string;
    status: boolean;
}

export interface CategoryTask{
    id: string;
    name: string;
    taskList: Task[];
}