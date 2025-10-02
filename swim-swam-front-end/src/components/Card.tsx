import React, { useEffect, useState, type ReactNode } from 'react';
import { IoMdCheckboxOutline } from "react-icons/io";
import { CiWarning } from "react-icons/ci";
import { IoTrashOutline } from "react-icons/io5";
import { HiOutlineXMark } from "react-icons/hi2";
import { FiEdit3 } from "react-icons/fi";
import { ScrollArea } from '../components/ui/scroll-area';
import { FaCirclePlus } from "react-icons/fa6";
import { SwimmerInput } from './ui/input';
import { useMeetStore } from "../stores/useMeetStore";
import { ArrowLeft } from './ui/arrows';
import { Input } from './ui/input';
import { Button } from './ui/button';
import type { MeetStore, Event, CardProps, EventCompetitionCardProps, EditCompetitionCardProps, SwimmersCardProps } from "@/types/meet";
import { EventComponent } from './ui/event';
import { useAlertStore } from '@/stores/useAlertStore';




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

const EventCompetitionCard: React.FC<EventCompetitionCardProps> = (props) => { 

    const [dayEvents, setDayEvents] = useState<Array<Event>>([]);

    // Get the events for the current day from the store
    const dayEventsStore: Array<Event> = useMeetStore((state: MeetStore) => state.meetData.days[props.index || 0]?.events || []);

    useEffect(() => {

        setDayEvents(dayEventsStore.map(event => event) || []);
    }, [dayEventsStore]);

    let events:ReactNode = null;

    const moveEvent = (index: number, direction: 'up' | 'down') => {
        if (index < 0 || index >= dayEvents.length) return;
        const newEvents = [...dayEvents];
        if (direction === 'up' && index > 0) {
            [newEvents[index - 1], newEvents[index]] = [newEvents[index], newEvents[index - 1]];
        } else if (direction === 'down' && index < dayEvents.length - 1) {
            [newEvents[index + 1], newEvents[index]] = [newEvents[index], newEvents[index + 1]];
        }
        setDayEvents(newEvents);
    };

    if(dayEvents.length > 0){
        events = dayEvents.map((event, index) => (
            <EventComponent clickEvent={props.clickEvent} swimmers={event.swimmers} swimmerCount={event.swimmers.length} moveEvent={moveEvent} numberOfEvents={dayEvents.length} dayNumber={props.index ?? 0} index={index} key={index + event.title} title={event.title} />
        ));
    }

    return(
        <div className=' flex flex-col justify-center items-center w-full h-full'>
            <div className='flex flex-col justify-center items-center w-full'>

                <ScrollArea className='h-46 w-80 rounded-md border flex justify-center items-center'>
                   {events}
                
                </ScrollArea>
               
            </div>
            <div className="flex justify-center items-center mb-4 mt-2 group hover:cursor-pointer" onClick={() => props.index !== undefined && props.handleAddEvent?.(true, props.index)}>
                <FaCirclePlus
                    className="text-green-500 mr-2  group-hover:text-green-600"
                    size={20}
                    onClick={() => props.index !== undefined && props.handleAddEvent?.(true, props.index)}
                />
                <h3 className="text-gray-400 group-hover:text-gray-600">Add event</h3>
            </div>
        </div>
    );

}



const SwimmersCard: React.FC<SwimmersCardProps> = ({ dayIndex, eventIndex }) => {

    const swimmersList = useMeetStore((state) => 
        dayIndex !== undefined && eventIndex !== undefined
            ? state.meetData.days[dayIndex]?.events[eventIndex]?.swimmers || []
            : []
    );

    const addSwimmer = useMeetStore((state) => state.addSwimmer);
    const orderSwimmers = useMeetStore((state) => state.sortSwimmersByTime);

    const swimmerInputs = swimmersList.map((swimmer, index) => (
        <SwimmerInput key={swimmer + String(index)} index={index} dayIndex={dayIndex} eventIndex={eventIndex} name={swimmer.name} css={'mb-2 mt-2 ml-2 w-75'} />
    ));

    return(
        <div className='flex flex-col justify-center items-center w-full h-full mt-1'>
            <ScrollArea className='h-46 w-80 rounded-md border flex justify-center items-center'> 
                {swimmerInputs}
            </ScrollArea>
            <div className="flex justify-center items-center mb-4 mt-2 group hover:cursor-pointer" onClick={() => {if (dayIndex !== undefined && eventIndex !== undefined) {addSwimmer(dayIndex, eventIndex);}}}>
                <FaCirclePlus
                    className="text-green-500 mr-2  group-hover:text-green-600"
                    size={20}
                />
                <h3 className="text-gray-400 group-hover:text-gray-600">Add swimmer</h3>
            </div>

            <div className="flex justify-center items-center mb-4 mt-2 group hover:cursor-pointer" onClick={() => {if (dayIndex !== undefined && eventIndex !== undefined) {orderSwimmers(dayIndex, eventIndex);}}}>
                <Button className='hover:cursor-pointer bg-blue-400 hover:bg-blue-500' variant="outline" size="sm">Order Swimmers</Button>
            </div>
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


    const updateDayTitle = useMeetStore((state) => state.updateDayTitle);
    const dayTitle: string = useMeetStore((state) => state.meetData.daysTitle[props.index || 0]);
    let inputCardTitle: React.ReactNode = props.title;
    const deleteDay = useMeetStore((state) => state.deleteDay);
    const setAlert = useAlertStore((state) => state.setAlert);
    const alertDelete = {
        show: true,
        message: "Are you sure you want to delete this day? This action cannot be undone.",
        confirmAction: () => {
            deleteDay(props.index || 0);
        },
    };

    if(props.type === 'eventPage'){
        inputCardTitle = <div className='w-full -mt-2 flex justify-center border-t-0 border-l-0 border-r-0 border-b-2 rounded-none border-blue-500'><Input className={'text-center w-3/4 mb-2'} placeholder={"Enter day title"} value={dayTitle} onChange={(e) => { if (props.index !== undefined) updateDayTitle(props.index, e.target.value); }} /></div>;
    }

    if(props.type === 'editPage'){
    cardElements = <EditCompetitionCard  status={props.status} dates={props.dates} editable={props.editable} />;
    } else if(props.type === 'eventPage'){
        cardClass = 'scale-70 sm:scale-100 min-h-60 h-auto w-90';
        cardElements = <EventCompetitionCard clickEvent={props.clickEvent} handleAddEvent={props.handleAddEvent} index={props.index}  status={props.status} />
    } else if(props.type === 'swimmers'){
        cardElements = <SwimmersCard dayIndex={props.index || 0} eventIndex={props.eventIndex || 0} />;
        cardClass = 'scale-70 sm:scale-100 min-h-60 h-auto w-90';
    }
    return(
    <div className={`bg-[#FFFBF6] rounded-lg shadow-md p-2 m-4 ${cardClass}`}>
        {props.type === 'eventPage' ? (
            <div className="w-full h-2 flex justify-start items-center -mb-1">
                <IoTrashOutline
                    className="cursor-pointer mt-6 hover:scale-110 hover:text-red-600"
                    size={18}
                    onClick={() => { if (setAlert) setAlert(alertDelete); }}
                />
            </div>
        ) : null}
        {props.type === 'swimmers' ? (
            <div className="w-full h-2 flex justify-start items-center -mb-1">
                <ArrowLeft
                    onClick={() => {
                        if (typeof props.clickEvent === "function" && props.index !== undefined && props.eventIndex !== undefined) {
                            props.clickEvent(props.index, props.eventIndex);
                        }
                    }}
                    css={{ cursor: "pointer", marginLeft: "0.5rem", marginTop: "0.5rem", marginBottom: "0.25rem" }}
                />
            </div>
        ) : null}
        <div className='text-center top-0.5 text-lg'>
            {inputCardTitle}
        </div>
        {cardElements}
    </div>
    );
};


export default Card;