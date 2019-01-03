
#pragma once

#include <<%= serverModuleName %>\<%= serverLibraryName %>\D<%= serverDocName %>.h>

#include "beginh.dex"

///////////////////////////////////////////////////////////////////////////////
//	Class CD<%= clientDocName %> Definition				
///////////////////////////////////////////////////////////////////////////////
//
//=============================================================================
class TB_EXPORT CD<%= clientDocName %> : public CClientDoc
{
	DECLARE_DYNCREATE(CD<%= clientDocName %>)

public:
	CD<%= clientDocName %>();
	~CD<%= clientDocName %>();

	D<%= serverDocName %>*		GetServerDoc()	{ return (D<%= serverDocName %>*)m_pServerDocument; }

protected:
	virtual BOOL	OnAttachData 		();
	virtual BOOL	OnPrepareAuxData 	();

	DECLARE_MESSAGE_MAP()
};

#include "endh.dex"
