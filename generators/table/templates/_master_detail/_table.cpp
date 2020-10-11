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
	f_DocNo.SetUpperCase();

	BindRecord();

	if (bCallInit) Init();
}

//-----------------------------------------------------------------------------
void <%= tableClassName %>::BindRecord()
{
	BEGIN_BIND_DATA();
	<%if (defaultFields) { -%>
		BIND_DATA	(_NS_FLD("DocID"),			f_DocID);
		BIND_DATA	(_NS_FLD("DocNo"),			f_DocNo);
		BIND_DATA	(_NS_FLD("DocDate"),		f_DocDate);
		BIND_DATA	(_NS_FLD("LastSubId"),		f_LastSubId);
	<% } -%>
	END_BIND_DATA();
}

//-----------------------------------------------------------------------------
LPCTSTR <%= tableClassName %>::GetStaticName() {return _NS_TBL("<%= tableName %>"); }

/////////////////////////////////////////////////////////////////////////////
//						class <%= tableClassName %>Details implementation
/////////////////////////////////////////////////////////////////////////////
//
//=============================================================================
IMPLEMENT_DYNCREATE(<%= tableClassName %>Details, SqlRecord)

//-----------------------------------------------------------------------------
<%= tableClassName %>Details::<%= tableClassName %>Details(BOOL bCallInit)
	:
	SqlRecord			(GetStaticName())
{
	f_Code.SetUpperCase();

	BindRecord();

	if (bCallInit) Init();
}

//-----------------------------------------------------------------------------
void <%= tableClassName %>Details::BindRecord()
 {
 	BEGIN_BIND_DATA();
	<%if (defaultFields) { -%>
 		BIND_DATA	(_NS_FLD("DocID"),			f_DocID);
 		BIND_DATA	(_NS_FLD("DocSubID"),		f_DocSubID);
 		BIND_DATA	(_NS_FLD("Code"),			f_Code);
 		BIND_DATA	(_NS_FLD("Description"),	f_Description);
	<% } -%>
	END_BIND_DATA();
}

//-----------------------------------------------------------------------------
LPCTSTR <%= tableClassName %>Details::GetStaticName() {return _NS_TBL("<%= tableName %>Details"); }

