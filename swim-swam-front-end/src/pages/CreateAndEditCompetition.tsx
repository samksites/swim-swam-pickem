import React, { useEffect }  from 'react';
import SwitchLabel from '@/components/Switch';
import Card from '@/components/Card';
import Line from '@/components/ui/line';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import PlusButton from '@/components/ui/plusButton';
import BlurBackground from '@/components/ui/blurBackground';
import { IoClose } from "react-icons/io5";
import { Combobox } from '@/components/ui/combobox';
import { DatePicker } from '@/components/ui/datePicker';
import { Button } from '@/components/ui/button';
import AllEvents from '../components/ui/allEvents';
import { useMeetStore } from "../stores/useMeetStore";
import type { CreateCompetitionProps } from "../types/components";
import { useAlertStore } from '@/stores/useAlertStore';
import checkCompetitionForSubmit, { convertMeetData } from '../lib/utils';
import type { MeetData } from '@/types/meet';
import meetJson from "../data/templateMeet.json";
import { meetApi } from '@/services/meetApi';

const ADMIN_USER_ID = (import.meta.env.VITE_ADMIN_USER_ID as string | undefined)?.trim() ?? "";

const oneYearFromNowIsoDate = (): string => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
};

const getValidDateOrDefault = (value: string | undefined): string => {
    const candidate = String(value ?? '').trim();
    if (!candidate) {
        return oneYearFromNowIsoDate();
    }

    const parsed = new Date(candidate);
    if (Number.isNaN(parsed.getTime())) {
        return oneYearFromNowIsoDate();
    }

    return candidate;
};

const parseOptionalDate = (value: string): Date | undefined => {
    const candidate = String(value ?? '').trim();
    if (!candidate) {
        return undefined;
    }

    const parsed = new Date(candidate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

/**
 * Component to create and edit competitions
 * @returns primary content of the page
 */
const CreateAndEditCompetition: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState<number>(0);

    // This function is used to change the active tab when a tab is clicked
    // It updates the state with the index of the clicked tab
    const handleTabChange = (index: number) => {
        setActiveTab(index);
    };

    const tabsCss = "w-25 text-[8px] md:w-40 md:text-[14px]"
    
    let content;
    if(activeTab === 0) {
        content = <ViewCompetitions />;
    } else{
        content = <CreateCompetition  id ={"-1"}/>;
    }

    return (
        <div className='Flex flex-col w-full h-full'>

            <div className='flex flex-row justify-center items-center w-full mt-4 mb-4'>
                <Tabs defaultValue="editComps" className="w-[400px] justify-center items-center">
                    <TabsList>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(0)} value="editComps">Edit competitions</TabsTrigger>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(1)} value="create">Create competitions</TabsTrigger>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(2)} value="updateLive">Live competitions</TabsTrigger>
                        <TabsTrigger className={tabsCss} onClick={() => handleTabChange(3)} value="password">Manage users</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Line css={{width: 'full', height: '3px', background: '#03adfc', marginBottom: '2rem'}} />
            { content }
        </div>
    );
        
           
};



// ViewCompetitions component to display all the competitions
const ViewCompetitions: React.FC = () => {
    return (
        <div className='Flex flex-col w-full h-full'>

            <div className='flex flex-row justify-center items-center w-full mt-12 mb-8'>
             <Input className='w-1/2' placeholder='Search for competitions'/>
            </div>
           

            <div className='flex flex-row justify-center flex-wrap w-full'>
                <SwitchLabel label='Show active competitions'/>
                <SwitchLabel  label='Show unfinished competitions'/>
                <SwitchLabel label='Show finished competitions'/>
            </div>
            <div className='flex flex-row justify-evenly flex-wrap w-full'>
                <Card title='Hold' type='editPage' status={0}/>
                <Card title='Hold' type='editPage' status={1}/>
                <Card title='Hold' type='editPage' status={2} dates={[["stats on:", "05/07/2025"],["Ends on:", "05/07/2025"]]} editable={true}/>
            </div>
            <div className='mt-3'>
                <Pagination>
                    <PaginationContent className=''>
                        <PaginationItem>
                            <PaginationPrevious className=' text-blue-400' href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink className=' text-blue-400' href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink className=' text-blue-400' href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink className=' text-blue-400' href="#">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis className=' text-blue-400'/>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink className=' text-blue-400' href="#">10</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext className=' text-blue-400' href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

        </div>
    );
}

/**
 * This component is used to create a new competition.
 * @returns Component to create a new competition
 */


const CreateCompetition: React.FC<CreateCompetitionProps> = () => {

     type MeetStoreState = {
        setMeetData: (data: MeetData) => void;
    }

    
    const [competition, setCompetition] = React.useState<React.ReactNode>(null);
    const [isBlurred, setIsBlurred] = React.useState<boolean>(false);
    const setMeet = useMeetStore((state: MeetStoreState) => state.setMeetData);


    const handleClose = () => {
        setCompetition(null);
        setIsBlurred(false);
    };
    return (
        <div className='flex flex-col justify-center items-center w-full h-full'>
            {competition === null ? (
                <PlusButton
                    onClick={() => {
                        setCompetition(<CompetitionEditor  onClick={handleClose} />);
                        setIsBlurred(true);
                        setMeet(convertMeetData(meetJson))
                    }}
                    txt={"Create new competition"}
                />
            ) : (
                <CompetitionEditor onClick={handleClose} />
            )}
            {isBlurred && <BlurBackground zIndex={1} />}
        </div>
    );
}

// CompetitionEditorEventSettings component to handle the settings for the competition for the event editor
const CompetitionEditorEventSettings: React.FC = () => {

    type MeetStoreState = {
        meetData: {
            title: string; // title of the meet
            type: string; // type can be 'scy', 'scm', or 'lcm'
            gender: string; // gender can be 'c', 'w', or 'm'
            startDate: string; // startDate is a string in the format 'YYYY-MM-DD'
            entriesCloseDate: string; // entriesCloseDate is a string in the format 'YYYY-MM-DD'
            // add other properties if needed
        };
        updateDistance?: (distance: string) => void;
        updateGender?: (gender: string) => void;
        updateTitle?: (title: string) => void;
        updateEntriesCloseDate?: (date: string) => void;
        updateStartDate?: (date: string) => void;
    }
    const meetType: string = useMeetStore((state: MeetStoreState) => state.meetData.type);
    const meetTitle: string = useMeetStore((state: MeetStoreState) => state.meetData.title);
    const meetGender: string = useMeetStore((state: MeetStoreState) => state.meetData.gender);
    const meetStartDate: string = useMeetStore((state: MeetStoreState) => state.meetData.startDate);
    const entriesCloseDate: string = useMeetStore((state: MeetStoreState) => state.meetData.entriesCloseDate);
    const setMeetTitle = useMeetStore((state: MeetStoreState) => state.updateTitle);
    const setMeetDistance = useMeetStore((state: MeetStoreState) => state.updateDistance);
    const setMeetGender = useMeetStore((state: MeetStoreState) => state.updateGender);
    const setEntriesCloseDate = useMeetStore((state: MeetStoreState) => state.updateEntriesCloseDate);
    const setStartDate = useMeetStore((state: MeetStoreState) => state.updateStartDate);

    useEffect(() => {
        
    }, [meetType]);
    return (
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <div className='flex flex-col justify-center items-center w-full'>
                    <h2 className='text-2xl text-center mt-6   text-white'>
                        Competition title   
                    </h2>
                    <Input onChange={(e) => setMeetTitle?.(e.target.value)} value={meetTitle} placeholder={"Enter meet title"} className=' mt-5 -mb-4 w-100 bg-white'/>
                </div>
                
        
        <div className='flex flex-col sm:flex-row justify-center flex-wrap items-center w-full mt-10 mb-4'>
                
                <div className="mt-5 mb-30 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20">
                    <Combobox
                        options={[
                            { value: 'scy', label: 'Short course yards' },
                            { value: 'scm', label: 'Short course meters' },
                            { value: 'lcm', label: 'Long course meters' }
                        ]}
                        baseValue={meetType}
                        action={setMeetDistance}
                    />
                </div>
                <div className="mt-5 mb-30 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20">
                    <Combobox options={[
                        { value: 'c', label: 'Combined' },
                        { value: 'w', label: 'Women' },
                        { value: 'm', label: 'Men' }
                    ]} 
                        baseValue={meetGender}
                        action={setMeetGender}
                        
                    />
                </div>
                <div className='w-full flex flex-col sm:flex-row items-center justify-center h-auto'>
                    <div className='h-40 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20'>
                        <DatePicker txt='Competition entries close date' savedDate={parseOptionalDate(entriesCloseDate)} action={setEntriesCloseDate}/>
                    </div>
                    
                    <div className='h-40 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20'>
                        <DatePicker  txt='Competition start date' savedDate={parseOptionalDate(meetStartDate)} action={setStartDate}/>
                    </div>
                </div>
            </div>
        </div>
    );
}


// EditEvent component to handle individual event editing
const EditEvent: React.FC<{ dayNumber: number; eventNumber: number; clickBack?: () => void }> = ({ dayNumber, eventNumber, clickBack }) => {


    const event = useMeetStore((state) => state.meetData.days[dayNumber].events[eventNumber]);

    return(
        <div>
            <Card title={event.title} type={'swimmers'} clickEvent={clickBack} index={dayNumber} eventIndex={eventNumber} swimmers={event.swimmers.map(swimmer => swimmer.name)} />
        </div>
    );
}

/**
 * A component to display the events for the competition editor or swimmers.
 * @returns Component to display the events for the competition editor or swimmers
 */

interface CompetitionEditorEventsProps {
    handleAddEvent?: (toggle: boolean, index: number) => void;
    backArrow:() => void;
    hideButtons: () => void;
}

const CompetitionEditorEvents: React.FC<CompetitionEditorEventsProps> = ({ handleAddEvent, backArrow, hideButtons }) => {

    const [editSwimmers, setEditSwimmers] = React.useState<React.ReactNode>(null);
    const [displayEvents, setDisplayEvents] = React.useState<boolean>(true);

      type Swimmer = {
        name: string;
        time: string;
        // add other swimmer properties as needed
    };

    type Event = {
        id: string;
        title: string;
        swimmers: Swimmer[];
        // add other event properties as needed
    };

    type Day = {
        id: string;
        events: Event[];
        title: string;
        // add other day properties as needed
    };

    type MeetStoreState = {
        meetData: {
            days: Day[];
        };
    };
    

    const editEvent = (day: number, event: number) => {
        setEditSwimmers(<EditEvent  clickBack={() =>{backArrow(); setDisplayEvents(true)}} dayNumber={day} eventNumber={event} />);
        setDisplayEvents(false);
        hideButtons();
    };


    let days: React.ReactNode = null;
    // Get the meet data from the store
    const meetDays: Day[] = useMeetStore((state: MeetStoreState) => state.meetData.days);
    // Map through the meetDays to create a Card for each day
    // Each Card will display the title of the day and will be clickable to edit the event
    if(displayEvents) {
        days = meetDays.map((day, index) => {

            return (
                <Card key={index + day.title} clickEvent={editEvent} handleAddEvent={handleAddEvent} index={index} title={day.title} type={'eventPage'} id={day.id} />
            );
        });
    }

    return(
        <div className='flex flex-wrap justify-center'>
            {displayEvents ? days : editSwimmers}
        </div>
    );
}


interface CompetitionEditorProps {
    new?: boolean;
    onClick?: () => void;
}

const CompetitionEditor: React.FC<CompetitionEditorProps> = ({onClick }) => {

    type MeetStoreState = {
        addDay: () => void;
    }

    // State to manage the active tab in the competition editor
    // It can be either the event settings, events, or edit JSON tab
    const [activeTab, setActiveTab] = React.useState<React.ReactNode>(<CompetitionEditorEventSettings />);
    const [addEvent, setAddEvent] = React.useState<boolean>(false);
    const [showButtons, setShowButtons] = React.useState<boolean>(false);
    const [whichTab, setWhichTab] = React.useState<string>("eventSettings");
    const [editDayIndex, setEditDayIndex] = React.useState<number>(-1);
    

    const addDay = useMeetStore((state: MeetStoreState) => state.addDay);


    const meetData = useMeetStore((state) => state.meetData);

    const saveMeet = async () => {
        try {
            if (!ADMIN_USER_ID) {
                throw new Error('Missing VITE_ADMIN_USER_ID. Set it in swim-swam-front-end/.env.local');
            }

            const meetDataToSave: MeetData = {
                ...meetData,
                entriesCloseDate: getValidDateOrDefault(meetData.entriesCloseDate),
                startDate: getValidDateOrDefault(meetData.startDate),
            };

            if (meetData.id === "-1") {
                const savedMeet = await meetApi.createMeet(meetDataToSave, ADMIN_USER_ID);
                useMeetStore.getState().setMeetData(savedMeet);
            } else {
                const updatedMeet = await meetApi.updateMeet(meetDataToSave, ADMIN_USER_ID);
                useMeetStore.getState().setMeetData(updatedMeet);
            }
            setAlert?.({
                show: true,
                message: "Competition saved successfully.",
                confirmAction: () => {},
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown save error";
            console.error("Error saving meet:", errorMessage);
            setAlert?.({
                show: true,
                message: `Failed to save competition: ${errorMessage}`,
                confirmAction: () => {},
            });
        }
    };

    /**
     * Handle the addition of a new event.
     * @param toggle - Whether to show or hide the add event form.
     */
    const handleAddEvent = (toggle: boolean, index: number) => {
        setShowButtons(true);
        setAddEvent(toggle);
        if(index !== -1){
        setEditDayIndex(index)
        }
    };

    const setAlert = useAlertStore((state) => state.setAlert);

    const exitAlert = {
        show: true,
        message: "Are you sure you want to exit before saving changes?",
        confirmAction: () => {
            onClick?.();
        },
    };

    const handleBackArrowClick = () => {
        setAddEvent(false);
        setShowButtons(false);
    };  

    const handleSubmitCompetition = () => {
        const meetData = useMeetStore.getState().meetData;

        const submitValidation = checkCompetitionForSubmit(meetData);

        if (submitValidation.valid) {
            setAlert?.({
                show: true,
                message: `You are about to submit the competition. You can still make changes until ${meetData.entriesCloseDate}.`,
                confirmAction: () => {
                    onClick?.();
                },
            });
        } else {
            // Show an error message
            setAlert?.({
                show: true,
                message: submitValidation.message,
                confirmAction: () => {
                    onClick?.();
                },
            });
        }
    };


    return (
        <div className='relative z-2 flex flex-col items-center min-h-80 rounded-md bg-gray-800 w-9/10 sm:min-h-150 h-auto mb-10'>
            <IoClose
                className="absolute top-3 left-3 cursor-pointer text-blue-500 transition-transform duration-150 hover:scale-110"
                size={32}
                onClick={() => setAlert?.(exitAlert)}
            />
            <h2 className='text-2xl text-center mt-4 mb-4 text-white'>
                {addEvent ? "" : "Edit Competition"}
            </h2>
            {addEvent ? (
                <AllEvents dayIndex={editDayIndex} backArrow={handleBackArrowClick}/>
            ) : <Tabs defaultValue={whichTab} className="w-[400px] justify-center items-center">
                    {showButtons  ? null : (
                        <TabsList>
                            <TabsTrigger onClick={() => {setActiveTab(<CompetitionEditorEventSettings />); setWhichTab("eventSettings");}}  value="eventSettings">Settings</TabsTrigger>
                            <TabsTrigger onClick={()=> {setActiveTab(<CompetitionEditorEvents hideButtons ={() => setShowButtons(true)} backArrow={handleBackArrowClick} handleAddEvent={handleAddEvent} />); setWhichTab("events");}}  value="events">Events</TabsTrigger>
                        </TabsList>
                    )}  
                </Tabs>}
            {addEvent ? null : <>{activeTab}</>}
            {showButtons  ? null : (
            <div className='flex flex-col justify-center items-center'> 
                {whichTab === 'events' ? (
                <div className='mb-6 mt-4' onClick={() => addDay()}>
                    <Button  variant="secondary" className="text-white w-50 bg-blue-500 cursor-pointer hover:bg-blue-600">
                        Add Day
                    </Button>
                </div>
                ) : null }
                <div className="flex flex-row gap-4 mb-4">
                    <Button variant="secondary" className="text-white w-50 bg-blue-500 cursor-pointer hover:bg-blue-600" onClick={saveMeet}>
                        Save competition
                    </Button>
                    <div onClick={() => handleSubmitCompetition()}>
                        <Button  variant="secondary" className="text-white w-50 bg-blue-500 cursor-pointer hover:bg-blue-600">
                            Submit competition
                        </Button>
                    </div>
                </div>
            </div>
            )}
        </div>
            
    );
}

export default CreateAndEditCompetition;
 