<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class FAQController extends Controller
{
    
    public function indexAction()
    {
    
    	$locale=$this->getRequest()->getLocale();
    	
    	//If search query posted, redirect to search page and pass search query as url hash
    	
    	$request = $this->getRequest();
    	if($request->request->get('search-text')) return $this->redirect(sprintf('%s#%s', $this->generateUrl('search',array('_locale'=>$locale)), 'text='.$request->request->get('search-text')));
   		
   		$user = $this->get('security.context')->getToken()->getUser();
    	
    	if(is_object($user)){
    		$displayName = $user->getDisplayName();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=0;	
    	}
    	
        return $this->render('JDACoreBundle:FAQ:faq.html.twig', array(
					// last displayname entered by the user
					'page'=> 'faq',
					'displayname'=>$displayName,
                    'userId'=>$userId,
		));
    	
    
    }
}
