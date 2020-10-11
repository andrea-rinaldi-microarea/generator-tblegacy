
#include "stdafx.h"             

#include "<%= tableClassName %>.h"

#ifdef _DEBUG
#undef THIS_FILE
static char THIS_FILE[] = __FILE__;
#endif

//-----------------------------------------------------------------------------
IMPLEMENT_DYNCREATE(<%= tableClassName %>, SqlRecord) 

//-----------------------------------------------------------------------------
<%= tableClassName %>::<%= tableClassName %>(BOOL bCallInit)
	:
	SqlRecord	(GetStaticName())
{
	f_Code.SetUpperCase();

	BindRecord();	
	if (bCallInit) Init();
}

//-----------------------------------------------------------------------------
void <%= tableClassName %>::BindRecord()
{
	BEGIN_BIND_DATA	();
	<%if (defaultFields) { -%>
		BIND_DATA	(_NS_FLD("Code"),			f_Code);
		BIND_DATA	(_NS_FLD("Description"),	f_Description);
	<% } -%>
		BIND_TB_GUID();
	END_BIND_DATA();    
}

//-----------------------------------------------------------------------------
LPCTSTR <%= tableClassName %>::GetStaticName() { return _NS_TBL("<%= tableName %>"); }