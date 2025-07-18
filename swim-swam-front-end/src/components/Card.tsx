import React from 'react';
import { IoMdCheckboxOutline } from "react-icons/io";
import { CiWarning } from "react-icons/ci";
import { HiOutlineXMark } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { ScrollArea } from '../components/ui/scroll-area';
import { IoTrashOutline } from "react-icons/io5";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaCirclePlus } from "react-icons/fa6";
import { SwimmerInput } from './ui/input';


type SwimmersCardProps = {
    swimmers?: Array<string>;
}

type EditCompetitionCardProps =  {
    status?: number;
    dates?: Array<Array<string>>;
    editable?: boolean;
}

type EventCompetitionCardProps =  {
    status?: number;

}

type CardProps = (EditCompetitionCardProps & EventCompetitionCardProps & SwimmersCardProps) & {
    title: string;
    type: 'editPage' | 'eventPage' | 'swimmers';
};


const EditCompetitionCard: React.FC<EditCompetitionCardProps> = (props) => {

    let statusSymbol: React.ReactNode;
    let editableSymbol: React.ReactNode;
    if(props.status === 0){
        statusSymbol = <IoMdCheckboxOutline size={'22px'} style={{ color: "green"}}/>
    } else if(props.status === 1){
        statusSymbol = <CiWarning size={'25px'} style={{ color: "orange"}}/>
    } else{
        statusSymbol = <HiOutlineXMark size={'25px'} style={{ color: "red"}}/>
    }
    if(props.editable){
        editableSymbol = <FiEdit3 className="cursor-pointer" size={'22px'} style={{color: "blue"}}/>
    }
    return (
    <div className='flex flex-col'>
        <div className='w-full flex flex-row justify-start items-center mb-0.5'>
            <h3 className='w-1/3 text-end mr-2'>Status:</h3>
            <div className='w-1/3 flex justify-center items-center'>
                {statusSymbol}
            </div>
            <div className='w-1/3'></div>
        </div> 
        {props.dates?.map((date, index) => (
                    <div key={index} className='w-full flex flex-row mt-0.5 mb-0.5 justify-start items-center'>
                        <h3 className='w-1/3 text-end mr-2'>{date[0]}</h3>
                        <div className='w-1/3 flex justify-center items-center'>
                            {date[1]}
                        </div>
                        <div className='w-1/3'></div>
                        
                    </div>
                ))}
        <div className='w-full flex flex-row justify-center items-center mt-2'>
            {editableSymbol}
        </div>
        
    </div>);
}

/**
 * A card component that displays events for a competition day.
 * @returns A card component that displays events for a competition.
 */

const EventCompetitionCard: React.FC<EventCompetitionCardProps> = () => { 

    const event: React.ReactNode = 
    <div className='flex flex-row justify-end items-center'>
        <div className='flex w-60 h-10 bg-blue-400 rounded-lg m-3 cursor-pointer'> 
            <div className='flex justify-center items-center w-full h-full text-white'>
                Mens 100m Freestyle
            </div>
            <div className="flex flex-col justify-center items-center ml-2">
               
            </div>
            <div className="flex flex-col justify-center items-center ml-2 mr-2">
                <FaArrowUp
                    className="cursor-pointer mb-0.5 text-white hover:text-gray-300"
                    size={14}
                    onClick={() => console.log('Up arrow clicked')}
                />
                <FaArrowDown
                    className="cursor-pointer mt-0.5 text-white hover:text-gray-300"
                    size={14}
                    onClick={() => console.log('Down arrow clicked')}
                />
            </div>
        </div>
        <IoTrashOutline
                    className="cursor-pointer -ml-2 mr-3 hover:scale-110 hover:text-red-600"
                    size={18}
                    onClick={() => console.log('Delete icon clicked')}
                />
        
    </div>


    return(
        <div className=' flex flex-col justify-center items-center w-full h-full'>
            <div className='flex flex-col justify-center items-center w-full'>

                <ScrollArea className='h-46 w-80 rounded-md border flex justify-center items-center'>
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                    {event}
                
                </ScrollArea>
               
            </div>
            <div className="flex justify-center items-center mb-4 mt-2 group hover:cursor-pointer">
                <FaCirclePlus
                    className="text-green-500 mr-2  group-hover:text-green-600"
                    size={20}
                    onClick={() => console.log('add')}
                />
                <h3 className="text-gray-400 group-hover:text-gray-600">Add event</h3>
            </div>
             
        </div>
    );

}



const SwimmersCard: React.FC<SwimmersCardProps> = () => {




    return(
        <div className='flex flex-col justify-center items-center w-full h-full'>
            <Tabs defaultValue="editSwimmers" className="w-[400px] mb-2 justify-center items-center">
                <TabsList>
                    <TabsTrigger  value="editSwimmers">Edit swimmers</TabsTrigger>
                    <TabsTrigger  value="editComps">Edit swimmers JSON</TabsTrigger>
                </TabsList>
            </Tabs>
            <ScrollArea className='h-46 w-80 rounded-md border flex justify-center items-center'> 
                <SwimmerInput name={'Sam Kettlewell-Sites'} css={'mb-2'}/>         
            </ScrollArea>
        </div>
    );
}




/**
 * Card component to display content in a card-like format.
 * @param {CardProps} props - The properties for the Card component.
 * @returns {JSX.Element} The rendered Card component.
 */

const Card: React.FC<CardProps> = (props) => { 
    
    let cardElements: React.ReactNode;
    let cardClass: string = 'h-40 w-70';

    if(props.type === 'editPage'){
    cardElements = <EditCompetitionCard  status={props.status} dates={props.dates} editable={props.editable} />;
    } else if(props.type === 'eventPage'){
        cardClass = 'scale-70 sm:scale-100 min-h-60 h-auto w-90';
        cardElements = <EventCompetitionCard  status={props.status} />
    } else if(props.type === 'swimmers'){
        cardElements = <SwimmersCard />;
        cardClass = 'scale-70 sm:scale-100 min-h-60 h-auto w-90';
    }
    return(
    <div className={`bg-[#FFFBF6] rounded-lg shadow-md p-2 m-4 ${cardClass}`}>
        <div className='text-center top-0.5 text-lg'>
            {props.title}
        </div>
        {cardElements}
        
    </div>
    );
};


export default Card;