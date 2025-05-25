import React from 'react';
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

const CreateAndEditCompetition: React.FC = () => {
    return (
        <div className='Flex flex-col w-full h-full'>

            <div className='flex flex-row justify-center items-center w-full mt-4 mb-4'>
                <Tabs defaultValue="account" className="w-[400px] justify-center items-center">
                    <TabsList>
                        <TabsTrigger value="editComps">Edit competitions</TabsTrigger>
                        <TabsTrigger value="create">Create competitions</TabsTrigger>
                        <TabsTrigger value="updateLive">Live competitions</TabsTrigger>
                        <TabsTrigger value="password">Manage users</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Line css={{width: 'full', height: '3px', background: '#03adfc', marginBottom: '2rem'}} />
            
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
};

export default CreateAndEditCompetition;