import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TabsDemoProps {
  onTabChange?: () => void;
}

export default function TabsComponent({ onTabChange }: TabsDemoProps) {
  return (
    <Tabs defaultValue="query" className="w-[90%] ">
      <TabsList className="grid w-full grid-cols-3 mb-4 h-10 p-0 rounded-t-md rounded-b-none ">
        <TabsTrigger
          value="query"
          className="rounded-t-md rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          Query
        </TabsTrigger>
        <TabsTrigger
          value="headers"
          className="rounded-t-md rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          Headers
        </TabsTrigger>
        <TabsTrigger
          value="body"
          className="rounded-t-md rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          Body
        </TabsTrigger>
      </TabsList>
      <TabsContent value="query">
        <Card>
          <p>Queries</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
