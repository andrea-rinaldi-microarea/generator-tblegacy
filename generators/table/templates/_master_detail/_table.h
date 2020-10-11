
#pragma once

#include "beginh.dex"


/////////////////////////////////////////////////////////////////////////////
class TB_EXPORT <%= tableClassName %> : public SqlRecord
{
	DECLARE_DYNCREATE(<%= tableClassName %>)

public:
<%if (defaultFields) { -%>
	DataLng		f_DocID;
    DataStr		f_DocNo;
	DataDate	f_DocDate;
	DataLng		f_LastSubId;
<% } -%>

public:
	<%= tableClassName %>(BOOL bCallInit = TRUE);

public:
	virtual void	BindRecord();

public:
	static LPCTSTR GetStaticName();
};

/////////////////////////////////////////////////////////////////////////////
class TB_EXPORT <%= tableClassName %>Details : public SqlRecord
{
	DECLARE_DYNCREATE(<%= tableClassName %>Details)

public:
<%if (defaultFields) { -%>
	DataLng		f_DocID;
	DataLng		f_DocSubID;
	DataStr		f_Code;
	DataStr		f_Description;
<% } -%>

public:
	<%= tableClassName %>Details(BOOL bCallInit = TRUE);

public:
	virtual void	BindRecord();

public:
	static LPCTSTR GetStaticName();
};
#include "endh.dex"
