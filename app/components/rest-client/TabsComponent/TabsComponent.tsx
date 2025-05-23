import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import QueryParamsEditor from '../QueryParamsEditor/QueryParamsEditor';
import { Card } from '@/components/ui/card';
import RequestBodyEditor from '../BodyEditor/BodyEditor';
import { useTranslations } from 'next-intl';
import { TabsComponentProps } from '@/app/interfaces';
import VariablesList from '@/app/components/variables/VariablesList';

export default function TabsComponent({
  value,
  onValueChange,
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
    <Tabs
      value={value}
      onValueChange={onValueChange}
      className="w-[90%] gap-0 flex flex-col h-full"
    >
      <TabsList className="grid w-full grid-cols-4 h-10 min-h-10 p-0 rounded-t-md rounded-b-none">
        <TabsTrigger
          value="query"
          className="bottom-0.5 border-cta-primary border-b-0 rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
        >
          {t('query')}
        </TabsTrigger>
        <TabsTrigger
          value="headers"
          className="bottom-0.5 border-cta-primary border-b-0 rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
        >
          {t('headers')}
        </TabsTrigger>
        <TabsTrigger
          value="body"
          className="bottom-0.5 border-cta-primary border-b-0 rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
        >
          {t('body')}
        </TabsTrigger>
        <TabsTrigger
          value="variables"
          className="bottom-0.5 border-cta-primary border-b-0 rounded-t-md cursor-pointer hover:bg-accent rounded-b-none data-[state=active]:bg-cta-primary data-[state=active]:text-slate-50 data-[state=active]:shadow-inner"
        >
          {t('variables')}
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
        <Card className="bg-cta-secondary rounded-t-none w-[100vw]">
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
        <Card className="border rounded-sm p-2 h-fit min-h-[100%] w-[100vw] text-sm">
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

      <TabsContent
        value="variables"
        className="w-[110%] p-2 overflow-y-auto min-h-0 flex overflow text-left"
      >
        <Card className="border-0 p-2 h-fit min-h-[100%] w-[100%]  bg-cta-secondary">
          <VariablesList />
        </Card>
      </TabsContent>
    </Tabs>
  );
}
