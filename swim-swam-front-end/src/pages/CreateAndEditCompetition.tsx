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
//import { ScrollArea } from '@radix-ui/react-scroll-area';


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
        content = <CreateCompetition />;
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
const CreateCompetition: React.FC = () => {
    
    const [competition, setCompetition] = React.useState<React.ReactNode>(null);
    const [isBlurred, setIsBlurred] = React.useState<boolean>(false);

        const handleClose = () => {
        setCompetition(null);
        setIsBlurred(false);
    };

    return (
        <div className='flex flex-col justify-center items-center w-full h-full'>
            {competition === null ? (
                <PlusButton
                    onClick={() => {
                        setCompetition(<CompetitionEditor onClick={handleClose} />);
                        setIsBlurred(true);
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
    return (
        <div className='flex flex-col sm:flex-row justify-center flex-wrap items-center w-full mt-10 mb-4'>
                <div className="mt-5 mb-30 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20">
                    <Combobox options={[
                        { value: 'scy', label: 'Short course yards' },
                        { value: 'scm', label: 'Short course meters' },
                        { value: 'lcm', label: 'Long course meters' }
                    ]} />
                </div>
                <div className="mt-5 mb-30 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20">
                    <Combobox options={[
                        { value: 'c', label: 'Combined' },
                        { value: 'w', label: 'Women' },
                        { value: 'm', label: 'Men' }
                    ]} />
                </div>
                <div className='w-full flex flex-col sm:flex-row items-center justify-center h-auto'>
                    <div className='h-40 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20'>
                        <DatePicker txt='Competition entries start date'/>
                    </div>
                    
                    <div className='h-40 sm:ml-4 sm:mr-4 md:ml-10 md:mr-10 lg:ml-20 lg:mr-20'>
                        <DatePicker  txt='Competition start date'/>
                    </div>
                </div>

                <Button variant="secondary" className={"text-white w-50 bg-blue-500 cursor-pointer hover:bg-blue-600"}>
                    Save competition
                </Button>
            </div>
    );
}


// EditEvent component to handle individual event editing
const EditEvent: React.FC = () => { 

    return(
        <div>
            <Card title={"Mens 100m Freestyle"} type={'swimmers'} swimmers={["Sam Kettlewell-Sites"]}/>
        </div>
    );
}

/**
 * A component to display the events for the competition editor or swimmers.
 * @returns Component to display the events for the competition editor or swimmers
 */

const CompetitionEditorEvents: React.FC = () => {

    const [activeElement, setActiveElement] = React.useState<React.ReactNode>(null);

    useEffect(() => {
        
        setActiveElement( <>
            <EditEvent />
            </>)

    }, []);

    return(
        <div className='flex flex-wrap justify-center'>
            {<Card title={"Day one"} type={'eventPage'} />}
            {activeElement}
        </div>
    );
}


interface CompetitionEditorProps {
    onClick?: () => void;
}

const CompetitionEditor: React.FC<CompetitionEditorProps> = ({ onClick }) => {

    // State to manage the active tab in the competition editor
    // It can be either the event settings, events, or edit JSON tab
    const [activeTab, setActiveTab] = React.useState<React.ReactNode>(<CompetitionEditorEventSettings />);

    return (
        <div className='relative z-2 flex flex-col items-center min-h-80 rounded-md bg-gray-800 w-9/10 h-220 sm:min-h-150 sm:h-auto mb-10'>
            <IoClose
                className="absolute top-3 left-3 cursor-pointer text-blue-500 transition-transform duration-150 hover:scale-110"
                size={32}
                onClick={onClick}
            />
            <h2 className='text-2xl text-center mt-4 mb-4 text-white'>
                Edit competition
            </h2>
            <Tabs defaultValue="eventSettings" className="w-[400px] justify-center items-center">
                <TabsList>
                    <TabsTrigger onClick={() => setActiveTab(<CompetitionEditorEventSettings />)}  value="eventSettings">Event settings</TabsTrigger>
                    <TabsTrigger onClick={()=> setActiveTab(<CompetitionEditorEvents />)}  value="events">Events</TabsTrigger>
                    <TabsTrigger  value="editJSON">Edit JSON</TabsTrigger>
                </TabsList>
            </Tabs>
            {activeTab}
            
        </div>
    );
}

export default CreateAndEditCompetition;