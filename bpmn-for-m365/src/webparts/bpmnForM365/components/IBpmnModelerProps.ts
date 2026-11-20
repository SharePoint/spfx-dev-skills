import type { BpmnService } from '../services/BpmnService';

export interface IBpmnModelerProps {
  service: BpmnService;
  fileUrl: string;
  isDarkTheme: boolean;
  backgroundColor: string;
  textColor: string;
}
