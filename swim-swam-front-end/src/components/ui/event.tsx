import { IoTrashOutline } from "react-icons/io5";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import type {Event} from "@/types/meet";
import { useMeetStore } from "../../stores/useMeetStore";
import { useAlertStore } from "@/stores/useAlertStore";

/**
 * 
 * @param props.title The title of the event
 * @param props.swimmers The swimmers in the event
 * @param props.index The index of the event (optional)
 * @returns 
 */
const EventComponent: React.FC<Event> = (props) => {

    const deleteEvent = useMeetStore((state) => state.deleteDayEvent);

        const setAlert = useAlertStore((state) => state.setAlert);
        const alertDelete = {
            show: true,
            message: "Are you sure you want to delete this event? This action cannot be undone.",
            confirmAction: () => {
                deleteEvent(props.dayNumber ?? 0, props.index ?? 0, props.title);
            },
        };


    return(
        <div className='flex flex-row justify-end items-center'>
            <div className='flex w-60 h-14 bg-blue-400 rounded-lg m-3 cursor-pointer hover:scale-102'> 
                <div onClick={() => props.clickEvent?.(props.dayNumber ?? 0, props.index ?? 0)} className='flex flex-col justify-center items-center w-full h-full text-black'>
                    {props.title}
                    <span className='ml-2'>Swimmer count: {props.swimmerCount}</span>
                </div>
                <div className="flex flex-col justify-center items-center ml-2">
                    
                </div>
                {(props.numberOfEvents ?? 0) > 1 && (
                    <div className="flex flex-col justify-center items-center ml-2 mr-2">
                        {props.index === 0 ? (
                            <FaArrowDown
                                className="cursor-pointer mt-0.5 text-white hover:text-gray-300"
                                size={14}
                                onClick={() => {
                                    if (props.moveEvent && typeof props.index === "number") {
                                        props.moveEvent(props.index, "down");
                                    }
                                }}
                            />
                        ) : (typeof props.numberOfEvents === "number" && props.index === props.numberOfEvents - 1) ? (
                            <FaArrowUp
                                className="cursor-pointer mb-0.5 text-white hover:text-gray-300"
                                size={14}
                                onClick={() => {
                                    if (props.moveEvent && typeof props.index === "number") {
                                        props.moveEvent(props.index, "up");
                                    }
                                }}
                            />
                        ) : (
                            <>
                                <FaArrowUp
                                    className="cursor-pointer mb-0.5 text-white hover:text-gray-300"
                                    size={14}
                                    onClick={() => {
                                        if (props.moveEvent && typeof props.index === "number") {
                                            props.moveEvent(props.index, "up");
                                        }
                                    }}
                                />
                                <FaArrowDown
                                    className="cursor-pointer mt-0.5 text-white hover:text-gray-300"
                                    size={14}
                                    onClick={() => {
                                        if (props.moveEvent && typeof props.index === "number") {
                                            props.moveEvent(props.index, "down");
                                        }
                                    }}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>
            <IoTrashOutline
                        className="cursor-pointer -ml-2 mr-3 hover:scale-110 hover:text-red-600"
                        size={18}
                        onClick={() => { if (setAlert) setAlert(alertDelete); }}
                    />
            
        </div>
    );
}




export { EventComponent};


