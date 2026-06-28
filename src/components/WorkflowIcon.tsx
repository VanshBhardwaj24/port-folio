"use client";

import React from "react";
import { 
  Globe, 
  Envelope, 
  Database, 
  Gear, 
  Brain, 
  SlackLogo, 
  Storefront, 
  CheckCircle, 
  Cloud, 
  FileText, 
  Shield 
} from "@phosphor-icons/react";

interface WorkflowIconProps {
  name: string;
  size?: number;
  className?: string;
}

export default function WorkflowIcon({ name, size = 20, className = "" }: WorkflowIconProps) {
  switch (name) {
    case "Globe": return <Globe size={size} className={className} />;
    case "Envelope": return <Envelope size={size} className={className} />;
    case "Database": return <Database size={size} className={className} />;
    case "Gear": return <Gear size={size} className={className} />;
    case "Brain": return <Brain size={size} className={className} />;
    case "Slack": return <SlackLogo size={size} className={className} />;
    case "Storefront": return <Storefront size={size} className={className} />;
    case "CheckCircle": return <CheckCircle size={size} className={className} />;
    case "FileText": return <FileText size={size} className={className} />;
    case "Shield": return <Shield size={size} className={className} />;
    case "Salesforce": return <Cloud size={size} className={className} />;
    default: return <Gear size={size} className={className} />;
  }
}
