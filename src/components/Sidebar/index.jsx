"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import { MdOutlineSpaceDashboard,MdOutlineInfo } from "react-icons/md";
import { TiMessages, TiMessage } from "react-icons/ti";
import { AiOutlineAppstore, AiOutlineProduct, AiOutlineSetting } from "react-icons/ai";
import { PiNewspaper } from "react-icons/pi";
import { IoDocumentsOutline } from "react-icons/io5";
import { GoPackage } from "react-icons/go";
import { IoMdBook } from "react-icons/io";
import { LuLayoutPanelTop } from "react-icons/lu";
import { PiBagSimpleBold } from "react-icons/pi";
import { FaRegQuestionCircle } from "react-icons/fa";
import { LuPaintbrushVertical } from "react-icons/lu";






// import { MdOutlineRecordVoiceOver, MdOutlineEventSeat } from "react-icons/md";
// import { AiOutlineSolution } from "react-icons/ai";
// import { FaPeoplePulling } from "react-icons/fa6";
// import useLocalStorage from "@/hooks/useLocalStorage";
// import Image from "next/image";


const menuGroups = [
  {
    name: "CONTENT MANAGEMENT",
    menuItems: [
      {
        icon: (<MdOutlineSpaceDashboard size="25" />),
        label: "Home Page",
        route: "/dashboard/home-page",
      },
      {
        icon: (<MdOutlineSpaceDashboard size="25" />),
        label: "About Page",
        route: "/dashboard/about-page",
      },
      
      {
        icon: (<MdOutlineSpaceDashboard size="25" />),
        label: "Contacts",
        route: "/dashboard/contact-page",
      },

      {
        icon: (<GoPackage size="25" />),
        label: "Sub Services",
        route: "/dashboard/sub-services",
      },

      {
        icon: (<IoMdBook size="25" />),
        label: "Blogs",
        route: "/dashboard/blogs",
      },

      {
        icon: (<PiBagSimpleBold size="25" />),
        label: "Career Page",
        route: "/dashboard/career-page",
      },

      {
        icon: (<FaRegQuestionCircle size="25" />),
        label: "Faq Page",
        route: "/dashboard/faqs",
      },

      {
        icon: (<IoDocumentsOutline  size="25" />),
        label: "Legal Docs",
        route: "/dashboard/legal-docs",
      },

      // {
      //   icon: (<MdOutlineSpaceDashboard size="25" />),
      //   label: "Footer Links",
      //   route: "/dashboard/footer-links",
      // },
      // {
      //   icon: (<AiOutlineSetting size="25" />),
      //   label: "Settings",
      //   route: "/dashboard/settings",
      // },
      // {
      //   icon: (<SlDocs size="25" />),
      //   label: "Dynamic Pages",
      //   route: "#",
      //   children: [
      //     { label: "Create", route: "/dashboard/dynamic-pages/create" },
      //     { label: "View", route: "/dashboard/dynamic-pages/view" },
      //   ],
      // },

    ],
  },

  {
    name: "GENERAL SETTINGS",
    menuItems: [
      {
        icon: (<LuLayoutPanelTop size="25" />),
        label: "Header",
        route: "/dashboard/header",
      },
      {
        icon: (<LuLayoutPanelTop size="25" />),
        label: "Footer",
        route: "/dashboard/footer",
      },

      {
        icon: (<LuPaintbrushVertical size="25" />),
        label: "Theme Settings",
        route: "/dashboard/theme-settings",
      },
    ],
  },

  {
    name: "FORM SUBMISSIONS",
    menuItems: [
      {
        icon: (<LuLayoutPanelTop size="25" />),
        label: "Career Form",
        route: "/dashboard/messages",
      },
      {
        icon: (<LuLayoutPanelTop size="25" />),
        label: "Enquiry Form",
        route: "/dashboard/messages",
      },
    ]
  },

  {
    name: "ACCOUNT",
    menuItems: [
      {
        icon: (<LuLayoutPanelTop size="25" />),
        label: "Change Password",
        route: "/dashboard/messages",
      },
      
    ]
  },


  // {
  //   name: "SERVICES",
  //   menuItems: [

  //     {
  //       icon: (<AiOutlineAppstore size="25" />),
  //       label: "Applications",
  //       route: "#",
  //       children: [
  //         { label: "Create", route: "/dashboard/applications/create" },
  //         { label: "View", route: "/dashboard/applications/view" },
  //         { label: "Page Settings", route: "/dashboard/applications/page-settings" },
  //       ],
  //     },

  //     {
  //       icon: (<AiOutlineAppstore size="25" />),
  //       label: "Case Studies",
  //       route: "#",
  //       children: [
  //         { label: "Create", route: "/dashboard/case-studies/create" },
  //         { label: "View", route: "/dashboard/case-studies/view" },
  //       ],
  //     },

  //     {
  //       icon: (<PiNewspaper size="25" />),
  //       label: "Blogs & News",
  //       route: "#",
  //       children: [
  //         { label: "Create", route: "/dashboard/blogs/create" },
  //         { label: "View", route: "/dashboard/blogs/view" },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   name: "TERMS",
  //   menuItems: [
  //     {
  //       icon: (<SlDocs size="25" />),
  //       label: "Legal Docs",
  //       route: "#",
  //       children: [
  //         { label: "Terms and conditions", route: "/dashboard/legal/terms" },
  //         { label: "Privacy policy", route: "/dashboard/legal/privacy" },
  //       ],
  //     },
  //   ],
  // },
];
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

  const pathname = usePathname();
  const [pageName, setPageName] = useState("selectedMenu", "dashboard");

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside className={`absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden border-r border-stroke bg-white dark:border-stroke-dark dark:bg-gray-dark lg:static lg:translate-x-0 ${sidebarOpen
        ? "translate-x-0 duration-300 ease-linear"
        : "-translate-x-full"}`}>
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5 xl:py-5 mb-2">
          <Link href="/" >
            <img src={"/images/logo/kripalogo.svg"} alt="Logo" priority className="dark:hidden" style={{ width: "100px", height: "auto" }} />
            <img src={"/images/logo/kripalogo.svg"} alt="Logo" priority className="hidden dark:block" style={{ width: "100px", height: "auto" }} />
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="block lg:hidden">
            <svg className="fill-current" width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z" fill="" />
            </svg>
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-1 px-4 lg:px-6">
            {menuGroups.map((group, groupIndex) => (<div key={groupIndex}>
              <h3 className="mb-5 text-sm font-medium text-dark-4 dark:text-dark-6">
                {group.name}
              </h3>
              <ul className="mb-6 flex flex-col gap-2">
                {group.menuItems.map((menuItem, menuIndex) => (<SidebarItem key={menuIndex} item={menuItem} pageName={pageName} setPageName={setPageName} />))}
              </ul>
            </div>))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};
export default Sidebar;
