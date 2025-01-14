"use client";
import dynamic from "next/dynamic";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@ui/components/ui/button";
import Resume from "./resumes/Resume_one";
import { A4Canvas } from "./A4canvas";
import "./EditPage.scss";
import generatePDF, { Resolution, Margin, Options } from "react-to-pdf";
import { Education } from "./Editor/Education";
import { Template1 } from "./Editor/templates/Template1";
import { Skills } from "./Editor/Skills";
import Tips from "./Tips";
import { Language } from "./Editor/Language";
import jsPDF from "jspdf";
import logo_short from "./logo_short.svg";
import logo from "./logo.svg";
import html2canvas from "html2canvas";
import CanvasResume from "./resumes/CanvasResume";
import ModernResume, { Resume2 } from "./resumes/Resume_two";
import template from "./template.png";
import Resume3 from "./resumes/Resume_three";
import { useResumeData } from "../hooks/useResumeData";
import { useActiveSection } from "../hooks/useActiveSection";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@ui/components/ui/collapsible";

import { FaUserTie } from "react-icons/fa";
import { FaRegLightbulb } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa";
import { MdWidgets } from "react-icons/md";
import { IoSchool } from "react-icons/io5";
import { FaSuitcase } from "react-icons/fa";
import { AiFillProject } from "react-icons/ai";
import { FaFileDownload } from "react-icons/fa";
import { IoMdDownload } from "react-icons/io";
import { FaTools } from "react-icons/fa";
import { CiCircleChevLeft } from "react-icons/ci";
import { PiCaretCircleRightFill } from "react-icons/pi";
import { PiCertificateFill } from "react-icons/pi";
import { FaLanguage } from "react-icons/fa6";
import { FcIdea } from "react-icons/fc";
import { MdTipsAndUpdates } from "react-icons/md";

import { FaChevronCircleRight } from "react-icons/fa";
import { FaChevronCircleLeft } from "react-icons/fa";
import { Scale } from "lucide-react";
import { zIndex } from "html2canvas/dist/types/css/property-descriptors/z-index";


const PersonalInfo = dynamic(
  () => import("./Editor/PersonalInfo").then((mod) => mod.PersonalInfo),
  { ssr: false },
);
const Experience = dynamic(
  () => import("./Editor/Experience").then((mod) => mod.Experience),
  { ssr: false },
);
const Certificate = dynamic(
  () => import("./Editor/Certificate").then((mod) => mod.Certificate),
  { ssr: false },
);
const Project = dynamic(
  () => import("./Editor/Project").then((mod) => mod.Project),
  { ssr: false },
);
const Achievement = dynamic(
  () => import("./Editor/Achievement").then((mod) => mod.Achievement),
  { ssr: false },
);

export default function EditPage() {
  const { resumeData, handleInputChange, handleAddField, handleDeleteField } =
  useResumeData();
  const { activeSection, handleSectionChange, sections, setActiveSection } =
  useActiveSection();
  const [previewImage , setPreviewImage] = useState<string | undefined>(undefined);

//   const { toPDF, targetRef } = usePDF({filename: 'finalCV.pdf'});

  // const handleDownload = async () => {
  //   const element = document.querySelector("#resume")!;
  //   //@ts-ignore
  //   html2canvas(element, {
  //     scale: 4,
  //     logging: false,
  //     useCORS: true,
  //     windowWidth: element.scrollWidth,
  //     windowHeight: element.scrollHeight,
  //   }).then((canvas) => {
  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF({
  //       orientation: "portrait",
  //       unit: "pt",
  //       format: "a4",
  //     });

  //     const pageWidth = pdf.internal.pageSize.getWidth();
  //     const pageHeight = pdf.internal.pageSize.getHeight();

  //     const widthRatio = pageWidth / canvas.width;
  //     const heightRatio = pageHeight / canvas.height;
  //     const ratio = widthRatio > heightRatio ? heightRatio : widthRatio;

  //     const canvasWidth = canvas.width * ratio;
  //     const canvasHeight = canvas.height * ratio;

  //     const marginX = (pageWidth - canvasWidth) / 2;
  //     const marginY = (pageHeight - canvasHeight) / 2;

  //     pdf.addImage(
  //       imgData,
  //       "PNG",
  //       marginX,
  //       marginY,
  //       canvasWidth,
  //       canvasHeight,
  //       undefined,
  //       "FAST",
  //     );

  //     pdf.save("resume.pdf");
  //   });
  //   const response = await fetch("/api/saveResume", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       // Make sure to include the userId in your resumeData
  //       resumeData: resumeData,
  //     }),
  //   });

  //   if (!response.ok) {
  //     console.error("Failed to save resume");
  //   }
  //   // Save resume data to the database
  // };


  useEffect(() => {
    // Convert the HTML to an image whenever resumeData changes
    const generatePreviewImage = async () => {
      const element = document.querySelector("#resume-preview")!;
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          logging: true,
          useCORS: true,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        });
        const imgData = canvas.toDataURL("image/png");
        setPreviewImage(imgData);
        console.log(imgData);
        
      }
    };

    generatePreviewImage();
  }, [resumeData]);

  const getSectionTitle = () => {
    switch(activeSection) {
        case "Personal Info": 
            return 'Add Personal Details';
            break;
        case "Education":
            return "Add Education";
            break;
        case "Experience":
            return "Add Work Experience";
            break;
        case "Project":
            return "Add Projects";
            break;
        case "Skills":
            return "Add Skills";
            break;
        case "Certificate":
            return "Add Certificates";
            break;
        case "Language":
            return "Add Languages";
            break;
        default: return;
            break;
    }
  }

  const options: Options = {
    filename: "advanced-example.pdf",
    // default is `save`
    method: "save",
    // default is Resolution.MEDIUM = 3, which should be enough, higher values
    // increases the image quality but also the size of the PDF, so be careful
    // using values higher than 10 when having multiple pages generated, it
    // might cause the page to crash or hang.
    resolution: Resolution.HIGH,
    page: {
      // margin is in MM, default is Margin.NONE = 0
      margin: Margin.NONE,
      // default is 'A4'
      format: "A4",
      // default is 'portrait'
      orientation: "portrait",
    },
    canvas: {
      // default is 'image/jpeg' for better size performance
      mimeType: "image/jpeg",
      qualityRatio: 1,
    },
    // customize any value passed to the jsPDF instance and html2canvas
    // function
    overrides: {
      // see https://artskydj.github.io/jsPDF/docs/jsPDF.html for more options
      pdf: {
        compress: true,
      },
      // see https://html2canvas.hertzen.com/configuration for more options
      canvas: {
        useCORS: true,
      },
    },
  };

  const openPDF = () => {
    generatePDF(() => document.getElementById("wrapper"), options);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-background text-foreground dark:bg-[#1a1b1e] dark:text-white">
        <Tips activeSection={activeSection} />
        {/* <div className="help-container">
            <FaLightbulb style={{width: '26px', height: '26px'}} />
        </div> */}
      {/* <div className="branding-container">
        <div className="logo">
            <Image alt="logo" src={logo} width={100} height={100} />
        </div>
      </div> */}
      <div className="editor-container">
        <div className="navigation">
            <div className="login-container">
                <div className="login-cta">Login</div>
            </div>
            <div className="nav-container">
                <div onClick={() => setActiveSection('Personal Info')} className={`icon-container ${activeSection === 'Personal Info' ? 'border' : ''}`}><FaUserTie className={`icon ${activeSection === 'Personal Info' ? 'selected' : ''}`} /></div>
                <div onClick={() => setActiveSection('Education')} className={`icon-container ${activeSection === 'Education' ? 'border' : ''}`}><IoSchool className={`icon ${activeSection === 'Education' ? 'selected' : ''}`} /></div>
                <div onClick={() => setActiveSection('Experience')} className={`icon-container ${activeSection === 'Experience' ? 'border' : ''}`}><FaSuitcase className={`icon ${activeSection === 'Experience' ? 'selected' : ''}`} /></div>
                <div onClick={() => setActiveSection('Project')} className={`icon-container ${activeSection === 'Project' ? 'border' : ''}`}><AiFillProject className={`icon ${activeSection === 'Project' ? 'selected' : ''}`} /></div>
                <div onClick={() => setActiveSection('Skills')} className={`icon-container ${activeSection === 'Skills' ? 'border' : ''}`}><FaTools className={`icon ${activeSection === 'Skills' ? 'selected' : ''}`} /></div>
                <div onClick={() => setActiveSection('Certificate')} className={`icon-container ${activeSection === 'Certificate' ? 'border' : ''}`}><PiCertificateFill className={`icon ${activeSection === 'Certificate' ? 'selected' : ''}`} /></div>
                <div onClick={() => setActiveSection('Language')} className={`icon-container ${activeSection === 'Language' ? 'border' : ''}`}><FaLanguage className={`icon ${activeSection === 'Language' ? 'selected' : ''}`} /></div>
            </div>
            <div className="branding-container">
                <Image alt="logo" src={logo} />
            </div>
        </div>
        <div className="editor">
            <div className="section-header">
                <div className="section-title">{getSectionTitle(activeSection)}</div>
                <div className="move-container">
                    <CiCircleChevLeft style={{marginRight: '50px', width: '40px', height: '40px', cursor: 'pointer'}} />
                    <PiCaretCircleRightFill style={{width: '40px', height: '40px', cursor: 'pointer'}} />
                </div>                
            </div>           
            <div className="material-container">
                {activeSection === "Personal Info" && (
                    <PersonalInfo
                        resumeData={resumeData}
                        handleInputChange={handleInputChange}
                    />
                )}
                {activeSection === "Education" && (
                    <Education
                        resumeData={resumeData}
                        handleInputChange={handleInputChange}
                        handleAddField={handleAddField}
                        handleDeleteField={handleDeleteField}
                    />
                )}
                {activeSection === "Experience" && (
                    <Experience
                        resumeData={resumeData}
                        handleInputChange={handleInputChange}
                        handleAddField={handleAddField}
                        handleDeleteField={handleDeleteField}
                    />
                )}
                {activeSection === "Skills" && (
                    <Skills
                        resumeData={resumeData}
                        handleInputChange={handleInputChange}
                        handleAddField={handleAddField}
                        handleDeleteField={handleDeleteField}
                    />
                )}
                {activeSection === "Project" && (
                    <Project
                        resumeData={resumeData}
                        handleInputChange={handleInputChange}
                        handleAddField={handleAddField}
                        handleDeleteField={handleDeleteField}
                    />
                )}
                {activeSection === "Certificate" && (
                    <Certificate
                        resumeData={resumeData}
                        handleInputChange={handleInputChange}
                        handleAddField={handleAddField}
                        handleDeleteField={handleDeleteField}
                    />
                )}
                {activeSection === "Language" && (
                    <Language
                        resumeData={resumeData}
                        handleInputChange={handleInputChange}
                        handleAddField={handleAddField}
                        handleDeleteField={handleDeleteField}
                    />
                )}
            </div>
            {/* <div className="movement">
                <div className="prev-container">
                    <FaChevronCircleLeft />
                    <div>Prev</div>
                </div>
                <div className="next-container">                        
                    <div>Next</div>
                    <FaChevronCircleRight />
                </div>
            </div>    */}
        </div>
        <div className="preview">
            <div className="tools">
                <div className="tools-container">
                    <div className="widgets">
                        <div className="change-template">
                            <MdWidgets />
                            <div>Change Template</div>
                        </div>
                        <div className="input-check">
                            <input type="checkbox" /> S
                        </div>
                        <div className="input-check">
                            <input type="checkbox" checked /> M
                        </div>
                        <div className="input-check">
                            <input type="checkbox" /> L
                        </div>                                        
                    </div>
                    <div className="download-container">
                        <div className="download" onClick={openPDF}>
                            <IoMdDownload />
                            <div>Download</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="preview-container" >
              <div className="final-image">
                <img src={previewImage} alt="" />
              </div>
                <div className="template-container">
                <Template1 resumeData={resumeData} id="resume-preview"  />
                </div>
                {/* <Image alt="template" src={template}  /> */}
            </div>
            {/* <div className="preview-container">                
                <Image alt="template" src={template}  />
            </div>             */}
        </div>
      </div>
    </div>
  );
}
