
#pragma once

#include "beginh.dex"

class <%= tableName %>;

/////////////////////////////////////////////////////////////////////////////
//							ADM<%= documentName %>Obj
/////////////////////////////////////////////////////////////////////////////
//
class TB_EXPORT ADM<%= documentName %>Obj : public ADMObj
{     
	DECLARE_ADMCLASS(ADM<%= documentName %>Obj)
		
public:
	virtual	ADMObj*				GetADM					()					= 0;
	virtual	<%= tableName %>*	Get<%= tableBaseName %>	()			const	= 0;
};

#include "endh.dex"
