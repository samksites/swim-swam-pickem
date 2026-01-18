import React from 'react';
import { ScrollArea } from './scroll-area';
import { useMeetStore } from "../../stores/useMeetStore";
import { ArrowLeft } from './arrows';

/**
 * Type for the AllEvents component
 */
type AllEventsProps = {
    backArrow: () => void;
    dayIndex: number; // optional index for the day
};


const AllEvents: React.FC<AllEventsProps> = ({ backArrow, dayIndex }) => {

 

    const allEvents = useMeetStore(state => state.meetData.allEvents);

    const addEventToDay = useMeetStore((state) => state.updateDayEventAndAllEvents);

    const availableEvents = (allEvents ?? []).map((event, index) => (
        !event.used ? (
            <div className='w-full flex justify-center items-center' key={event.name + String(index)}>
                <div  onClick={() => {addEventToDay(dayIndex, event.name); backArrow();}} className='hover:bg-blue-400 hover:cursor-pointer m-2 rounded-md text-center border-2 w-3/4 flex flex-col justify-center items-center'>
                    {event.name}
                </div>
            </div>
        ) : null
    ));

    return (
        <div className='flex flex-col mt-4 justify-center items-center w-60 h-110 bg-white rounded-md'>
            <div className=' flex justify-start items-center w-full'>
                <div className='hover:cursor-pointer hover:scale-110  -mt-8' onClick={backArrow}>
                    <ArrowLeft css={{ marginLeft: "8px" }} />
                </div>
            </div>
            <h2 className='text-2xl font-bold mb-4'>Available Events</h2>
            <ScrollArea className='w-9/10 h-3/4 flex flex-col justify-center items-center border-2 rounded-md -mt-2'>
                {availableEvents}
            </ScrollArea>
        </div>
    );
};


export default AllEvents;