import { useState } from "react";
import { GoShieldLock } from "react-icons/go";
import { BsFillGrid1X2Fill } from "react-icons/bs";
import { BsGraphUpArrow } from "react-icons/bs";
import { BsFillPeopleFill } from "react-icons/bs";
import { BsFillGearFill } from "react-icons/bs";

function Sidebar() {
    return (
        <>
            <aside className="w-64 h-screen bg-white/30 backdrop-blur-[10px] fixed border-r border-gray-200">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-8">
                        <GoShieldLock className="text-3xl gradient-text " />
                        <h1 className="text-xl font-bold gradient-text">BiometricVote</h1>
                    </div>
                    <nav className="space-y-3">
                        <a href="Dashboard.html" className="flex items-center p-3 hover:bg-indigo-200 text-blue-400 rounded-lg">
                            <BsFillGrid1X2Fill className="mr-3" />
                            Dashboard
                        </a>
                        <a href="electioncontrol.html" className="flex items-center p-3 hover:bg-indigo-200 text-blue-400 rounded-lg">
                            <BsGraphUpArrow className="mr-3" />
                            Election Control
                        </a>
                        <a href="VoteAnalytics.html" className="flex items-center p-3 hover:bg-indigo-200 text-blue-400 rounded-lg">
                            <BsGraphUpArrow className="mr-3" />
                            Analytics
                        </a>
                        <a href="accountinfo.html" className="flex items-center p-3 hover:bg-indigo-200 text-blue-400 rounded-lg">
                            <BsFillPeopleFill className="mr-3" />
                            Verify Identity
                        </a>
                        <a href="Settings.html" className="flex items-center p-3 hover:bg-indigo-200 text-blue-400 rounded-lg">
                            <BsFillGearFill className="mr-3" />
                            Settings
                        </a>
                    </nav>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
