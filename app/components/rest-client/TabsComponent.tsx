import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QueryParamsEditor from './QueryParamsEditor';
import { Card } from '@/components/ui/card';
import RequestBodyEditor from './BodyEditor';
import { useTranslations } from 'next-intl';
import { TabsComponentProps } from '@/app/interfaces';

export default function TabsComponent({
  onTabChange,
  queryParams,
  onAddQueryParam,
  onQueryParamKeyChange,
  onQueryParamValueChange,
  onDeleteQueryParam,
  headers,
  onAddHeader,
  onHeaderKeyChange,
  onHeaderValueChange,
  onDeleteHeader,
  requestBody,
  onBodyChange,
  bodyLanguage,
  showPrettifyButton,
  showLanguageSelector,
  onBodyLanguageChange,
}: TabsComponentProps) {
  const t = useTranslations('RESTful');
  return (
    <Tabs defaultValue="query" className="w-[90%] gap-0 flex flex-col h-full">
      <TabsList className="grid w-full grid-cols-3 h-10 min-h-10 p-0 rounded-t-md rounded-b-none">
        <TabsTrigger
          value="query"
          className=" bottom-0.5 border-cta-primary border-b-0 rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          {t('query')}
        </TabsTrigger>
        <TabsTrigger
          value="headers"
          className=" bottom-0.5 border-cta-primary border-b-0 rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          {t('headers')}
        </TabsTrigger>
        <TabsTrigger
          value="body"
          className="bottom-0.5 border-cta-primary border-b-0 rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
          onClick={onTabChange}
        >
          {t('body')}
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="query"
        className="w-[110%] overflow-y-auto min-h-0 flex overflow"
      >
        <Card className="h-auto bg-cta-secondary rounded-t-none w-[100vw]">
          <QueryParamsEditor
            items={queryParams}
            onAddItem={onAddQueryParam}
            onItemKeyChange={onQueryParamKeyChange}
            onItemValueChange={onQueryParamValueChange}
            onDeleteItem={onDeleteQueryParam}
            addButtonLabel={t('add')}
            keyInputPlaceholder={t('key')}
            valueInputPlaceholder={t('value')}
          />
        </Card>
      </TabsContent>
      <TabsContent
        value="headers"
        className="w-[110%] overflow-y-auto min-h-0 flex overflow"
      >
        <Card className=" bg-cta-secondary rounded-t-none w-[100vw]">
          <QueryParamsEditor
            items={headers}
            onAddItem={onAddHeader}
            onItemKeyChange={onHeaderKeyChange}
            onItemValueChange={onHeaderValueChange}
            onDeleteItem={onDeleteHeader}
            addButtonLabel={t('add')}
            keyInputPlaceholder={t('key')}
            valueInputPlaceholder={t('value')}
          />
        </Card>
      </TabsContent>
      <TabsContent
        value="body"
        className="w-[110%] p-2 overflow-y-auto min-h-0 flex overflow"
      >
        <Card className="border rounded-sm p-2 h-fit min-h-[100%] w-[100vw]">
          <RequestBodyEditor
            value={requestBody}
            contentEditable={false}
            onChange={onBodyChange}
            language={bodyLanguage}
            readOnly={false}
            showPrettifyButton={showPrettifyButton}
            showLanguageSelector={showLanguageSelector}
            onLanguageChange={onBodyLanguageChange}
          />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
